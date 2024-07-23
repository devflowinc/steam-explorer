import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const apiHeaders = {
  "TR-Dataset": import.meta.env.VITE_TRIEVE_DATASET as string,
  "X-API-Version": "V2",
  Authorization: import.meta.env.VITE_TRIEVE_KEY as string,
  "Content-Type": "application/json",
};
