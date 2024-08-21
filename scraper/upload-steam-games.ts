import dotenev from "dotenv";
dotenev.config();
import { createClient } from "redis";

const chunkSize = "50";

// Define the data structure for your CSV data
interface GameData {
  AppID: string;
  name: string;
  release_date: string;
  required_age: number;
  price: number;
  dlc_count: number;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  reviews: string;
  adultGame: boolean;
  header_image: string;
  website: string;
  support_url: string;
  support_email: string;
  windows: boolean;
  mac: boolean;
  linux: boolean;
  metacritic_score: number;
  metacritic_url: string;
  achievements: number;
  recommendations: number;
  notes: string;
  supported_languages: string[];
  full_audio_languages: string[];
  packages: {
    title: string;
    description: string;
    subs: {
      text: string;
      description: string;
      price: number;
    }[];
  }[];
  developers: string[];
  publishers: string[];
  categories: string[];
  genres: string[];
  screenshots: string[];
  movies: string[];
  user_score: number;
  score_rank: string;
  positive: number;
  negative: number;
  positiveNegativeRatio: number;
  totalPositiveNegative: number;
  estimated_owners: string;
  average_playtime_forever: number;
  average_playtime_2weeks: number;
  median_playtime_forever: number;
  median_playtime_2weeks: number;
  peak_ccu: number;
  tags: {
    [tag: string]: number;
  };
}

const redisClient = await createClient({
  url: process.env.REDIS_URI,
}).connect();

// Function to transform GameData to a searchable string
function gameToSearchableString(game: GameData): string {
  let searchableString = "";

  // Safely adds a field to the searchable string if it exists
  const addField = (
    field: string | undefined,
    prefix: string = "",
    postfix: string = "\n\n"
  ) => {
    if (field) {
      searchableString += `${prefix}${field}${postfix}`;
    }
  };
  // Process each field with a safe check and appropriate formatting
  addField(game["about_the_game"], "Game Description: ");
  addField(game["name"], "Game Name: ");

  if (game["categories"]) {
    addField(game["categories"].join(","), "Game Categories: ");
  }

  if (game["developers"]) {
    addField(game["developers"].join(","), "Game Developers: ");
  }

  if (game["publishers"]) {
    addField(game["publishers"].join(","), "Game Publishers: ");
  }

  if (game["tags"]) {
    addField(Object.keys(game["tags"]).join(","), "Game Tags: ");
  }

  return searchableString.trim();
}

async function processGameData() {
  while (true) {
    let items = await redisClient.sendCommand(["rpop", "newGames", chunkSize]);
    if (!items) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    const createChunkData = (
      await Promise.all(
        Object.values(items).map(async (i) => {
          const unserializedItem = await redisClient.hmGet("dataset", i);
          console.log("it");
          const item = JSON.parse(unserializedItem[0]);
          console.log("it", gameToSearchableString(item));

          if ("positive" in item) {
            item["positiveNegativeRatio"] = Math.ceil(
              (item["positive"] /
                (item["positive"] + (item["negative"] || 0))) *
                100
            );
            item["totalPositiveNegative"] =
              item["positive"] + (item["negative"] || 0);
          }

          return {
            chunk_html: gameToSearchableString(item),
            link: `https://store.steampowered.com/app/${i}` ?? "",
            image_urls: item["screenshots"] || null,
            tracking_id: i ?? "",
            tag_set: [
              ...(item["genres"] ?? ""),
              ...(item["categories"] ?? ""),
              ...(item["tags"] ? Object.keys(item["tags"]) : []),
              ...(item["adultGame"] ? ["adult_game"] : []),
            ],
            semantic_boost: {
              distance_factor: 0.5,
              phrase: item["name"],
            },
            fulltext_boost: {
              boost_factor: 2,
              phrase: item["name"],
            },
            metadata: item,
            time_stamp: item["release_date"]
              ? new Date(item["release_date"]).toISOString()
              : new Date().toISOString(),
            upsert_by_tracking_id: true,
            weight: item["metacritic_score"] || 1,
          };
        })
      )
    ).filter((uploadData) => {
      if (
        uploadData.tag_set.includes("Hentai") ||
        uploadData.tag_set.includes("Sexual Content") ||
        uploadData.tag_set.includes("NSFW")
      ) {
        return false;
      } else {
        return true;
      }
    });

    if (createChunkData.length == 0) {
      continue;
    }

    try {
      await fetch("https://api.trieve.ai/api/chunk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "TR-Dataset": process.env.TRIEVE_DATASET as string,
          Authorization: process.env.TRIEVE_KEY as string,
        },
        body: JSON.stringify(createChunkData),
      })
        .then((rsp) => rsp.json())
        .then(console.log);
    } catch (error) {
      console.error(`Failed to create chunk`);
      console.error(error);
    }
  }
}
processGameData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`Error processing file:`, error);
    process.exit(1);
  });
