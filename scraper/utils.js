import { DateTime } from "luxon";
import { LOG_ICON } from "./consts.js";

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
