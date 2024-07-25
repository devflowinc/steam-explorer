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
  getRecommendedGames: (games: string[]) => void;
  clearSelectedGames: () => void;
  removeSelectedGame: (id: string) => void;
}

export const useGameState = create<GameState>()(
  persist(
    (set) => ({
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
      removeSelectedGame: (id: string) =>
        set((state) => ({
          selectedGames: state.selectedGames.filter(
            (game) => game.tracking_id !== id
          ),
        })),
      getRecommendedGames: async (games: string[]) => {
        set((state) => ({ ...state, isLoading: true, recommendedGames: [] }));
        const recommendations = await getRecommendations({
          games: games,
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
