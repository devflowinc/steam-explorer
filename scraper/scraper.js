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
  DEFAULT_TIMEOUT,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  INFO,
  WARNING,
  ERROR,
  EXCEPTION,
} from "./consts.js";
import {
  log,
  progressBar,
  sanitizeText,
  priceToFloat,
  getLanguages,
  getGamePkgs,
} from "./utils.js";

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

const getDate = (app) => {
  try {
    return app.release_date && !app.release_date.coming_soon
      ? new Date(app.release_date.date).toISOString()
      : "";
  } catch {
    return "";
  }
};

function parseSteamGame(app) {
  return {
    name: app.name.trim(),
    release_date: getDate(app),
    dlc_count: app.dlc ? app.dlc.length : 0,
    detailed_description: app.detailed_description?.trim() ?? "",
    price:
      app.is_free || !app.price_overview
        ? 0.0
        : priceToFloat(app.price_overview.final_formatted),
    about_the_game: app.about_the_game?.trim() ?? "",
    short_description: app.short_description?.trim() ?? "",
    reviews: app.reviews?.trim() ?? "",
    platforms: {
      windows: app.platforms?.windows,
      mac: app.platforms?.mac,
      linux: app.platforms?.linux,
    },
    header_image: app.header_image?.trim() ?? "",
    website: app.website?.trim() ?? "",
    metacritic_score: app.metacritic ? parseInt(app.metacritic.score) : 0,
    metacritic_url: app.metacritic?.url ?? "",
    achievements: app.achievements ? parseInt(app.achievements.total) : 0,
    recommendations: app.recommendations?.total ?? 0,
    notes: app.content_descriptors?.notes ?? "",
    developers: app.developers?.map((developer) => developer.trim()),
    publishers: app.publishers?.map((publisher) => publisher.trim()),
    categories: app.categories?.map((category) =>
      category?.description?.trim()
    ),
    genres: app.genres?.map((genres) => genres?.description?.trim()),
    screenshots: app.screenshots?.map((screenshot) => screenshot?.path_full),
    detailed_description: sanitizeText(app.detailed_description),
    about_the_game: sanitizeText(app.about_the_game),
    short_description: sanitizeText(app.short_description),
    reviews: sanitizeText(app.reviews),
    notes: sanitizeText(app.notes),
    movies: app.movies?.map((movie) => movie?.mp4?.max),
    ...getLanguages(app),
    packages: getGamePkgs(app),
    adult_game: app.ratings?.steam_germany?.banned === "1",
  };
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
