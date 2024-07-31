import dotenev from "dotenv"
dotenev.config()
import fs from "fs";
import json from "big-json";
import { createClient } from 'redis';

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
  url: process.env.REDIS_URI
}).connect();

// Function to transform GameData to a searchable string
function jobToSearchableString(job: GameData): string {
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
  addField(job["about_the_game"], "Game Description: ");
  addField(job["name"], "Game Name: ");
  addField(job["categories"].join(","), "Game Categories: ");
  addField(job["developers"].join(","), "Game Developers: ");
  addField(job["publishers"].join(","), "Game Publishers: ");
  addField(Object.keys(job["tags"]).join(","), "Game Tags: ");

  return searchableString.trim();
}

async function processGameData() {
    let items = await redisClient.hVals("dataset");

    const createChunkData = Object.keys(items).map((i) => {
      const unserializedItem = items[i];
      console.log(unserializedItem);
      const item = JSON.parse(unserializedItem);
      
      
      return {
        chunk_html: jobToSearchableString(item),
        link: `https://store.steampowered.com/app/${i}` ?? "",
        image_urls: item["screenshots"] || null,
        tracking_id: i ?? "",
        tag_set: [
          ...(item["genres"] ?? ""),
          ...(item["categories"] ?? ""),
          ...(item["tags"] ? Object.keys(item["tags"]) : []),
        ],
        metadata: item,
        time_stamp: item["release_date"]
          ? new Date(item["release_date"]).toISOString()
          : new Date().toISOString(),
        upsert_by_tracking_id: true,
       };

    });

    const chunkSize = 50;
    const chunkedItems: any[] = [];
    for (let i = 0; i < createChunkData.length; i += chunkSize) {
      const chunk = createChunkData.slice(i, i + chunkSize);
      chunkedItems.push(chunk);
    }

    for (const chunk of chunkedItems) {
      try {
        await fetch("https://api.trieve.ai/api/chunk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "TR-Dataset": process.env.TRIEVE_DATASET as string,
            Authorization: process.env.TRIEVE_KEY as string,
          },
          body: JSON.stringify(chunk),
        })
          .then((rsp) => rsp.json())
          .then(console.log);
      } catch (error) {
        console.error(`Failed to create chunk`);
        console.error(error);
      }
    }

    return items;
}
processGameData().catch((error) => {
  console.error(`Error processing file:`, error);
});
