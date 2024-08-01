import { DateTime } from "luxon";
import axios from "axios";
import {
  LOG_ICON,
  WARNING,
  ERROR,
  EXCEPTION,
  DEFAULT_SLEEP,
  DEFAULT_RETRIES,
  DEFAULT_AUTOSAVE,
  DEFAULT_TIMEOUT,
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
} from "./consts.js";

export function log(level, message) {
  console.log(
    `[${LOG_ICON[level]} ${DateTime.now().toFormat("HH:mm:ss")}] ${message}.`
  );
}

export function sanitizeText(text) {
  return (text || "")
    .replace(/\n\r|\r\n|\r \n|\r|\n|\t/g, " ")
    .replace("&quot;", "'")
    .replace(/(https|http):\/\/(\w|\.|\/|\?|\=|\&|\%)*\b/g, "")
    .replace(/<[^<]+?>/g, " ")
    .replace(/ +/g, " ")
    .trim();
}

export function priceToFloat(price, decimals = 2) {
  return parseFloat(price.replace("$", "").replace(",", ".")).toFixed(decimals);
}

export const getLanguages = (app) => {
  let full_audio_languages = [];
  let supported_languages = [];
  if (app.supported_languages) {
    let languagesApp = app.supported_languages
      .replace(/<[^<]+?>/g, "")
      .replace("languages with full audio support", "");
    languagesApp.split(", ").map((lang) => {
      lang = lang.replace("*", "");
      if (lang.includes("*")) {
        full_audio_languages.push(lang);
      }
      supported_languages.push(lang);
    });
  }

  return { full_audio_languages, supported_languages };
};

export const getGamePkgs = (app) => {
  let packages = [];
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
      packages.push({
        title: sanitizeText(pkg.title),
        description: sanitizeText(pkg.description),
        subs,
      });
    });
  }

  return packages;
};

const getDate = (app) => {
  try {
    return app.release_date && !app.release_date.coming_soon
      ? new Date(app.release_date.date).toISOString()
      : "";
  } catch {
    return "";
  }
};

export function shuffle(array) {
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

export function parseSteamGame(app) {
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

export async function doRequest(
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
      await new Promise((resolve) => setTimeout(resolve, retryTime * 100));
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
