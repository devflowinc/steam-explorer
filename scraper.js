"use strict";

import fs from "fs";
import axios from "axios";
import path from "path";
import { ArgumentParser } from "argparse";
import { DateTime } from "luxon";

const DEFAULT_INFILE = "./data/games.json";
const DEFAULT_OUTFILE = "./data/games.json";
const APPLIST_FILE = "./data/applist.json";
const DISCARTED_FILE = "./data/discarted.json";
const NOTRELEASED_FILE = "./data/notreleased.json";
const DEFAULT_SLEEP = 1.5;
const DEFAULT_RETRIES = 4;
const DEFAULT_AUTOSAVE = 100;
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_CURRENCY = "us";
const DEFAULT_LANGUAGE = "en";
const LOG_ICON = ["i", "W", "E", "!"];
const INFO = 0;
const WARNING = 1;
const ERROR = 2;
const EXCEPTION = 3;

function log(level, message) {
  console.log(
    `[${LOG_ICON[level]} ${DateTime.now().toFormat("HH:mm:ss")}] ${message}.`
  );
}

function progressBar(title, count, total) {
  const barLen = 75;
  const filledLen = Math.floor((barLen * count) / total);

  const percents = ((100.0 * count) / total).toFixed(2);
  const bar = "█".repeat(filledLen) + "░".repeat(barLen - filledLen);

  process.stdout.write(
    `[i ${DateTime.now().toFormat(
      "HH:mm:ss"
    )}] ${title} ${bar} ${percents}% (CTRL+C to exit).\r`
  );
}

function sanitizeText(text) {
  return text
    .replace(/\n\r|\r\n|\r \n|\r|\n|\t/g, " ")
    .replace("&quot;", "'")
    .replace(/(https|http):\/\/(\w|\.|\/|\?|\=|\&|\%)*\b/g, "")
    .replace(/<[^<]+?>/g, " ")
    .replace(/ +/g, " ")
    .trim();
}

function priceToFloat(price, decimals = 2) {
  return parseFloat(price.replace(",", ".")).toFixed(decimals);
}

async function doRequest(
  url,
  parameters = null,
  retryTime = 5,
  successCount = 0,
  errorCount = 0,
  retries = 0
) {
  try {
    const response = await axios.get(url, {
      params: parameters,
      timeout: DEFAULT_TIMEOUT,
    });

    if (response.status === 200) {
      errorCount = 0;
      successCount += 1;
      if (successCount > retryTime) {
        retryTime = Math.min(5, retryTime / 2);
        successCount = 0;
      }
      return response;
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    log(EXCEPTION, `An exception of type ${error.name} occurred.`);
    if (retries === 0 || errorCount < retries) {
      errorCount += 1;
      successCount = 0;
      retryTime = Math.min(retryTime * 2, 500);
      log(WARNING, `${error.message}, retrying in ${retryTime} seconds`);
      await new Promise((resolve) => setTimeout(resolve, retryTime * 1000));
      return doRequest(
        url,
        parameters,
        retryTime,
        successCount,
        errorCount,
        retries
      );
    } else {
      console.log("[!] No more retries.");
      process.exit();
    }
  }
}

async function steamRequest(
  appID,
  retryTime,
  successRequestCount,
  errorRequestCount,
  retries,
  currency = DEFAULT_CURRENCY,
  language = DEFAULT_LANGUAGE
) {
  const url = "http://store.steampowered.com/api/appdetails/";
  const response = await doRequest(
    url,
    { appids: appID, cc: currency, l: language },
    retryTime,
    successRequestCount,
    errorRequestCount,
    retries
  );

  if (response) {
    try {
      const data = response.data;
      const app = data[appID];
      if (
        !app.success ||
        app.data.type !== "game" ||
        (app.data.is_free === false &&
          app.data.price_overview &&
          app.data.price_overview.final_formatted === "") ||
        (app.data.developers && app.data.developers.length === 0)
      ) {
        return null;
      } else {
        return app.data;
      }
    } catch (error) {
      log(
        EXCEPTION,
        `An exception of type ${error.name} occurred. Traceback: ${error.stack}`
      );
      return null;
    }
  } else {
    log(ERROR, "Bad response");
    return null;
  }
}

async function steamSpyRequest(
  appID,
  retryTime,
  successRequestCount,
  errorRequestCount,
  retries
) {
  const url = `https://steamspy.com/api.php?request=appdetails&appid=${appID}`;
  const response = await doRequest(
    url,
    null,
    retryTime,
    successRequestCount,
    errorRequestCount,
    retries
  );

  if (response) {
    try {
      const data = response.data;
      if (data.developer !== "") {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      log(
        EXCEPTION,
        `An exception of type ${error.name} occurred. Traceback: ${error.stack}`
      );
      return null;
    }
  } else {
    log(ERROR, "Bad response");
    return null;
  }
}

function parseSteamGame(app) {
  const game = {};
  game.name = app.name.trim();
  game.release_date =
    app.release_date && !app.release_date.coming_soon
      ? app.release_date.date
      : "";
  game.required_age = app.required_age
    ? parseInt(app.required_age.replace("+", ""))
    : 0;

  if (app.is_free || !app.price_overview) {
    game.price = 0.0;
  } else {
    game.price = priceToFloat(app.price_overview.final_formatted);
  }

  game.dlc_count = app.dlc ? app.dlc.length : 0;
  game.detailed_description = app.detailed_description?.trim() ?? "";
  game.about_the_game = app.about_the_game?.trim() ?? "";
  game.short_description = app.short_description?.trim() ?? "";
  game.reviews = app.reviews?.trim() ?? "";
  game.header_image = app.header_image?.trim() ?? "";
  game.website = app.website?.trim() ?? "";
  game.support_url = app.support_info?.url?.trim() ?? "";
  game.support_email = app.support_info?.email?.trim() ?? "";
  game.windows = app.platforms?.windows ?? false;
  game.mac = app.platforms?.mac ?? false;
  game.linux = app.platforms?.linux ?? false;
  game.metacritic_score = app.metacritic ? parseInt(app.metacritic.score) : 0;
  game.metacritic_url = app.metacritic?.url ?? "";
  game.achievements = app.achievements ? parseInt(app.achievements.total) : 0;
  game.recommendations = app.recommendations?.total ?? 0;
  game.notes = app.content_descriptors?.notes ?? "";

  game.supported_languages = [];
  game.full_audio_languages = [];

  if (app.supported_languages) {
    let languagesApp = app.supported_languages
      .replace(/<[^<]+?>/g, "")
      .replace("languages with full audio support", "");
    let languages = languagesApp.split(", ").map((lang) => {
      lang = lang.replace("*", "");
      if (lang.includes("*")) {
        game.full_audio_languages.push(lang);
      }
      game.supported_languages.push(lang);
    });
  }

  game.packages = [];
  if (app.package_groups) {
    app.package_groups.forEach((pkg) => {
      let subs = [];
      if (pkg.subs) {
        pkg.subs.forEach((sub) => {
          subs.push({
            text: sanitizeText(sub.option_text),
            description: sub.option_description,
            price: (
              parseFloat(sub.price_in_cents_with_discount) * 0.01
            ).toFixed(2),
          });
        });
      }
      game.packages.push({
        title: sanitizeText(pkg.title),
        description: sanitizeText(pkg.description),
        subs,
      });
    });
  }

  game.developers = [];
  if (app.developers) {
    app.developers.forEach((developer) =>
      game.developers.push(developer.trim())
    );
  }

  game.publishers = [];
  if (app.publishers) {
    app.publishers.forEach((publisher) =>
      game.publishers.push(publisher.trim())
    );
  }

  game.categories = [];
  if (app.categories) {
    app.categories.forEach((category) =>
      game.categories.push(category.description)
    );
  }

  game.genres = [];
  if (app.genres) {
    app.genres.forEach((genre) => game.genres.push(genre.description));
  }

  game.screenshots = [];
  if (app.screenshots) {
    app.screenshots.forEach((screenshot) =>
      game.screenshots.push(screenshot.path_full)
    );
  }

  game.movies = [];
  if (app.movies) {
    app.movies.forEach((movie) => game.movies.push(movie.mp4.max));
  }

  game.detailed_description = sanitizeText(game.detailed_description);
  game.about_the_game = sanitizeText(game.about_the_game);
  game.short_description = sanitizeText(game.short_description);
  game.reviews = sanitizeText(game.reviews);
  game.notes = sanitizeText(game.notes);

  return game;
}

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

    for (let appID of apps) {
      if (!dataset[appID] && !discarted.includes(appID)) {
        if (args.released && notreleased.includes(appID)) continue;

        const app = await steamRequest(
          appID.toString(),
          Math.min(4, args.sleep),
          successRequestCount,
          errorRequestCount,
          args.retries
        );
        if (app) {
          const game = parseSteamGame(app);
          if (game.release_date !== "") {
            const extra = args.steamspy
              ? await steamSpyRequest(
                  appID.toString(),
                  Math.min(4, args.sleep),
                  successRequestCount,
                  errorRequestCount,
                  args.retries
                )
              : null;

            if (args.steamspy && extra) {
              Object.assign(game, {
                user_score: extra.userscore,
                score_rank: extra.score_rank,
                positive: extra.positive,
                negative: extra.negative,
                estimated_owners: extra.owners
                  .replace(/,/g, "")
                  .replace("..", "-"),
                average_playtime_forever: extra.average_forever,
                average_playtime_2weeks: extra.average_2weeks,
                median_playtime_forever: extra.median_forever,
                median_playtime_2weeks: extra.median_2weeks,
                peak_ccu: extra.ccu,
                tags: extra.tags,
              });
            } else if (args.steamspy) {
              Object.assign(game, {
                user_score: 0,
                score_rank: "",
                positive: 0,
                negative: 0,
                estimated_owners: "0 - 0",
                average_playtime_forever: 0,
                average_playtime_2weeks: 0,
                median_playtime_forever: 0,
                median_playtime_2weeks: 0,
                peak_ccu: 0,
                tags: [],
              });
            }

            dataset[appID] = game;
            gamesAdded += 1;

            if (notreleased.includes(appID)) {
              notreleased = notreleased.filter((id) => id !== appID);
            }

            if (
              args.autosave > 0 &&
              gamesAdded > 0 &&
              gamesAdded % args.autosave === 0
            ) {
              saveJSON(dataset, args.outfile, true);
            }
          } else {
            if (!notreleased.includes(appID)) {
              notreleased.push(appID);
              gamesNotReleased += 1;

              if (
                args.autosave > 0 &&
                gamesNotReleased > 0 &&
                gamesNotReleased % args.autosave === 0
              ) {
                saveJSON(notreleased, NOTRELEASED_FILE, true);
              }
            }
          }
        } else {
          discarted.push(appID);
          gamesDiscarted += 1;

          if (
            args.autosave > 0 &&
            gamesDiscarted > 0 &&
            gamesDiscarted % args.autosave === 0
          ) {
            saveJSON(discarted, DISCARTED_FILE, true);
          }
        }
        await new Promise((res) =>
          setTimeout(res, args.sleep * (Math.random() > 0.1 ? 1 : 2.0) * 1000)
        );
        count += 1;
        progressBar("Scraping", count, total);
      }
    }

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
  const args = parser.parse_args();

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
