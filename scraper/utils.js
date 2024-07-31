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

export function progressBar(title, count, total) {
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
};
