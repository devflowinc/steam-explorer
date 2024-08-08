import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Chunk } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const apiHeaders = {
  "TR-Dataset": import.meta.env.VITE_TRIEVE_DATASET as string,
  "X-API-Version": "V2",
  Authorization: import.meta.env.VITE_TRIEVE_KEY as string,
  "Content-Type": "application/json",
};

export const calculateSteamApprovalPercentage = (game: Chunk): number => {
  const total = game.metadata.negative + game.metadata.positive;
  return parseInt(((game.metadata.positive / total) * 100).toFixed());
};
