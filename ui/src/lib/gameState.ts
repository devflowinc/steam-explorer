import { create } from "zustand";
import { APIResponse, Chunk } from "./types";
import { getGames, getRecommendations } from "./api";

interface GameState {
  selectedGames: Chunk[];
  addGame: (game: Chunk) => void;
  isLoading: boolean;
  shownGames: APIResponse[];
  getGamesForSearch: (term: string, filters: any) => void;
  recommendedGames: {
    [games: string]: Chunk[];
  };
  getRecommendedGames: (games: string) => void;
  clearSelectedGames: () => void;
  removeSelectedGame: (id: string) => void;
}

export const useGameState = create<GameState>()((set) => ({
  recommendedGames: {},
  selectedGames: [],
  addGame: (game) =>
    set((state) => ({
      selectedGames: [...state.selectedGames, game],
    })),
  isLoading: false,
  shownGames: [],
  getGamesForSearch: async (term: string, filters: any) => {
    if (term) {
      set(() => ({ isLoading: true }));
      const games = await getGames({ searchTerm: term, filters });
      set(() => ({
        shownGames: games,
        isLoading: false,
      }));
    }
  },
  clearSelectedGames: () =>
    set(() => ({
      selectedGames: [],
    })),
  removeSelectedGame: (id: string) =>
    set((state) => ({
      selectedGames: state.selectedGames.filter(
        (game) => game.tracking_id !== id
      ),
    })),
  getRecommendedGames: async (games: string) => {
    set(() => ({ isLoading: true }));
    const gamesAsArray = games?.split(",") as string[];
    const recommendations = await getRecommendations({
      games: gamesAsArray,
    });
    set((state) => ({
      recommendedGames: {
        ...state.recommendedGames,
        [games]: recommendations,
      },
      isLoading: false,
    }));
  },
}));
