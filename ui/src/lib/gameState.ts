import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APIResponse, Chunk } from "./types";
import { getGames, getRecommendations } from "./api";

interface GameState {
  selectedGames: Chunk[];
  addGame: (game: Chunk) => void;
  isLoading: boolean;
  shownGames: APIResponse[];
  getGamesForSearch: (term: string) => void;
  recommendedGames: Chunk[];
  getRecommendedGames: () => void;
  clearSelectedGames: () => void;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      recommendedGames: [],
      selectedGames: [],
      addGame: (game) =>
        set((state) => ({
          ...state,
          selectedGames: [...state.selectedGames, game],
        })),
      isLoading: false,
      shownGames: [],
      getGamesForSearch: async (term: string) => {
        set((state) => ({ ...state, isLoading: true }));
        const games = await getGames({ searchTerm: term });
        set((state) => ({ ...state, shownGames: games, isLoading: false }));
      },
      clearSelectedGames: () =>
        set((state) => ({
          ...state,
          selectedGames: [],
        })),
      getRecommendedGames: async () => {
        set((state) => ({ ...state, isLoading: true }));
        const recommendations = await getRecommendations({
          games: get().selectedGames.map((g) => g.tracking_id),
        });
        set((state) => ({
          ...state,
          recommendedGames: recommendations,
          isLoading: false,
        }));
      },
    }),
    {
      name: "steam-explorer",
    }
  )
);
