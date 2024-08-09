import { create } from "zustand";
import { APIResponse, Chunk } from "./types";
import {
  getFirstLoadGames,
  getGames,
  getRecommendations,
  getSuggestedQueries,
} from "./api";

interface GameState {
  selectedGames: Chunk[];
  negativeGames: Chunk[];
  addGame: (game: Chunk) => void;
  addNeg: (game: Chunk) => void;
  isLoading: boolean;
  shownGames: APIResponse[];
  getGamesForSearch: (term: string, filters: any) => void;
  recommendedGames: Chunk[];
  getRecommendedGames: (games: string[]) => void;
  clearSelectedGames: () => void;
  removeSelectedGame: (id: string) => void;
  suggestedQueries: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const useGameState = create<GameState>()((set) => ({
  selectedCategory: "",
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  recommendedGames: {},
  selectedGames: [],
  negativeGames: [],
  suggestedQueries: [],
  addGame: (game) =>
    set((state) => ({
      selectedGames: [...state.selectedGames, game],
    })),
  addNeg: (game) =>
    set((state) => ({
      negativeGames: [...state.selectedGames, game],
    })),
  isLoading: false,
  shownGames: [],
  getGamesForSearch: async (term: string, filters: any) => {
    set(() => ({ isLoading: true }));
    if (term) {
      const [games, suggestedQueries] = await Promise.all([
        getGames({
          searchTerm: term,
          filters,
        }),
        getSuggestedQueries({ term }),
      ]);

      set(() => ({
        shownGames: games,
        suggestedQueries,
        isLoading: false,
      }));
    } else {
      const games = await getFirstLoadGames();
      set(() => ({
        shownGames: games,
        suggestedQueries: [],
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
  getRecommendedGames: async (gamesAsArray: string[]) => {
    set(() => ({ isLoading: true }));
    const recommendations = await getRecommendations({
      games: gamesAsArray,
    });
    set((state) => ({
      recommendedGames: [
        ...recommendations,
      ],
      isLoading: false,
    }));
  },
}));
