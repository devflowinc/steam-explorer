import { ArgumentParser } from "argparse";
import { createClient } from 'redis';
import {
  doRequest,
  sanitizeText,
  getLanguages,
  getGamePkgs,
  priceToFloat
} from "./utils.js";
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

let redisClient = null;

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

(async () => {

  const parser = new ArgumentParser({
    description: "Steam games scraper",
  });

  parser.add_argument("-R", "--redis-uri", {
    type: "str",
    required: true,
    help: "Full redis uri ex: redis://127.0.0.1"
  });

  const args = parser.parse_args();

  redisClient = await createClient({
    url: args.redis_uri
  }).connect();

  let successRequestCount = 0;
  let errorRequestCount = 0;

  while (true) {
    const { element, key } = await redisClient.brPop('appsToVisit', 0, 0);
      console.log("hi");
    const appID = element
    if (!await redisClient.hExists("dataset", appID) && !await redisClient.sIsMember("discarted", appID)) {
      if (args.released && await redisClient.sIsMemmber("notreleased", appID)) continue;

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
          
          console.log("setting")
          await redisClient.hSet("dataset", appID, JSON.stringify(game))

          if (await redisClient.sIsMember("notreleased", appID)) {
            await redisClient.sRem("notreleased", appID)
          }
        } else {
          if (!await redisClient.sIsMember("notreleased", appID)) {
            await redisClient.sIsMember("notreleased", appID)
            await redisClient.sAdd("notreleased", appID);
          }
        }
      } else {
        await redisClient.sAdd("discarted", appID)
      }

    }
  }

})();

