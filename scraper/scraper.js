import { createClient } from "redis";
import fs from "fs";
import axios from "axios";
import path from "path";
import { ArgumentParser } from "argparse";
import {
  DEFAULT_INFILE,
  DEFAULT_OUTFILE,
  APPLIST_FILE,
  DISCARTED_FILE,
  NOTRELEASED_FILE,
  DEFAULT_SLEEP,
  DEFAULT_RETRIES,
  DEFAULT_AUTOSAVE,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  INFO,
  ERROR,
  EXCEPTION,
} from "./consts.js";
import { log, progressBar, doRequest } from "./utils.js";

let redisClient = null;

function saveJSON(data, filename, backup = false) {
  try {
    if (backup && fs.existsSync(filename)) {
      const backupFile = path.join(
        path.dirname(filename),
        `${path.basename(filename, path.extname(filename))}.bak`
      );
      fs.renameSync(filename, backupFile);
    }

    fs.writeFileSync(filename, JSON.stringify(data, null, 4), "utf-8");
  } catch (error) {
    log(
      EXCEPTION,
      `An exception of type ${error.name} occurred. Traceback: ${error.stack}`
    );
    process.exit();
  }
}

async function loadJSON(filename) {
  let data = null;
  try {
    if (fs.existsSync(filename)) {
      log(INFO, `Loading '${filename}'`);
      const text = fs.readFileSync(filename, "utf-8");
      if (text.length > 0) {
        data = JSON.parse(text);
      }
    }
  } catch (error) {
    log(
      EXCEPTION,
      `An exception of type ${error.name} occurred. Traceback: ${error.stack}`
    );
    process.exit();
  }
  return data;
}

async function scraper(dataset, notreleased, discarted, args, appIDs = null) {
  let apps = [];
  if (appIDs === null || appIDs === undefined) {
    if (fs.existsSync(APPLIST_FILE)) {
      const text = fs.readFileSync(APPLIST_FILE, "utf-8");
      if (text.length > 0) {
        apps = JSON.parse(text);
        log(INFO, `List with ${apps.length} games loaded`);
      }
    } else {
      log(INFO, "Requesting list of games from Steam");
      const response = await doRequest(
        "http://api.steampowered.com/ISteamApps/GetAppList/v2/"
      );
      if (response) {
        await new Promise((res) => setTimeout(res, args.sleep * 1000));
        const data = response.data;
        apps = data.applist.apps.map((app) => app.appid.toString());
        fs.writeFileSync(APPLIST_FILE, JSON.stringify(apps, null, 4), "utf-8");
      }
    }
  } else {
    apps = appIDs;
  }

  function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }

  if (apps.length > 0) {
    let gamesAdded = 0;
    let gamesNotReleased = 0;
    let gamesDiscarted = 0;
    let successRequestCount = 0;
    let errorRequestCount = 0;

    shuffle(apps);
    const total = apps.length;
    let count = 0;

    await redisClient.lPush("appsToVisit", apps);

    progressBar("Scraping", total, total);
    process.stdout.write("\r\n");
    log(
      INFO,
      `Scrape completed: ${gamesAdded} new games added, ${gamesNotReleased} not released, ${gamesDiscarted} discarted`
    );
    saveJSON(dataset, args.outfile);
    saveJSON(discarted, DISCARTED_FILE);
    saveJSON(notreleased, NOTRELEASED_FILE);
  } else {
    log(ERROR, "Error requesting list of games");
    process.exit();
  }
}

(async () => {
  log(
    INFO,
    "Steam Games Scraper 1.2.2 by Martin Bustos <fronkongames@gmail.com>"
  );

  const parser = new ArgumentParser({
    description: "Steam games scraper",
  });

  parser.add_argument("-i", "--infile", {
    type: "str",
    default: DEFAULT_INFILE,
    help: "Input file name",
  });
  parser.add_argument("-o", "--outfile", {
    type: "str",
    default: DEFAULT_OUTFILE,
    help: "Output file name",
  });
  parser.add_argument("-s", "--sleep", {
    type: "float",
    default: DEFAULT_SLEEP,
    help: "Waiting time between requests",
  });
  parser.add_argument("-r", "--retries", {
    type: "int",
    default: DEFAULT_RETRIES,
    help: "Number of retries (0 to always retry)",
  });
  parser.add_argument("-a", "--autosave", {
    type: "int",
    default: DEFAULT_AUTOSAVE,
    help: "Record the data every number of new entries (0 to deactivate)",
  });
  parser.add_argument("-d", "--released", {
    default: true,
    help: "If it is on the list of not yet released, no information is requested",
  });
  parser.add_argument("-c", "--currency", {
    type: "str",
    default: DEFAULT_CURRENCY,
    help: "Currency code",
  });
  parser.add_argument("-l", "--language", {
    type: "str",
    default: DEFAULT_LANGUAGE,
    help: "Language code",
  });
  parser.add_argument("-p", "--steamspy", {
    type: "str",
    default: true,
    help: "Add SteamSpy info",
  });
  parser.add_argument("-u", "--update", {
    type: "str",
    default: "",
    help: "Update using APPIDs from a CSV file",
  });

  parser.add_argument("-R", "--redis-uri", {
    type: "str",
    required: true,
    help: "Full redis uri ex: redis://127.0.0.1",
  });
  const args = parser.parse_args();

  redisClient = await createClient({
    url: args.redis_uri,
  }).connect();

  if (args.h || args.help) {
    parser.print_help();
    process.exit();
  }

  let dataset = await loadJSON(args.infile);
  let discarted = await loadJSON(DISCARTED_FILE);
  let notreleased = await loadJSON(NOTRELEASED_FILE);

  if (dataset === null) {
    dataset = {};
  }

  if (discarted === null) {
    discarted = [];
  }

  if (notreleased === null) {
    notreleased = [];
  }

  log(
    INFO,
    `Dataset loaded with ${Object.keys(dataset).length} games` ||
      "New dataset created"
  );

  if (notreleased.length > 0) {
    log(INFO, `${notreleased.length} games not released yet`);
  }

  if (discarted.length > 0) {
    log(INFO, `${discarted.length} apps discarted`);
  }

  try {
    await scraper(dataset, notreleased, discarted, args);
  } catch (error) {
    saveJSON(dataset, args.outfile, args.autosave > 0);
    saveJSON(discarted, DISCARTED_FILE, args.autosave > 0);
    saveJSON(notreleased, NOTRELEASED_FILE, args.autosave > 0);

    log(
      EXCEPTION,
      `An exception of type ${error.name} occurred. Traceback: ${error.stack}`
    );
  }

  log(INFO, "Done");
})();
