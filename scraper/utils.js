import { DateTime } from "luxon";

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
  return text
    .replace(/\n\r|\r\n|\r \n|\r|\n|\t/g, " ")
    .replace("&quot;", "'")
    .replace(/(https|http):\/\/(\w|\.|\/|\?|\=|\&|\%)*\b/g, "")
    .replace(/<[^<]+?>/g, " ")
    .replace(/ +/g, " ")
    .trim();
}

export function priceToFloat(price, decimals = 2) {
  return parseFloat(price.replace(",", ".")).toFixed(decimals);
}
