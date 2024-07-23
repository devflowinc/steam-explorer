import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Chunk } from "./types";

interface GameState {
  games: Chunk[];
  addGame: (game: Chunk) => void;
}

export const useGameState = create<GameState>()(
  persist(
    (set) => ({
      games: [],
      addGame: (game) => set((state) => ({ games: [...state.games, game] })),
    }),
    {
      name: "steam-explorer",
    }
  )
);
