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
  toggleAddGame: (game: Chunk) => void;
  toggleAddNeg: (game: Chunk) => void;
  isLoading: boolean;
  shownGames: APIResponse[];
  getGamesForSearch: (term: string, filters: any) => void;
  recommendedGames: Chunk[];
  getRecommendedGames: () => void;
  clearSelectedGames: () => void;
  removeSelectedGame: (id: string) => void;
  suggestedQueries: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const useGameState = create<GameState>()((set, get) => ({
  selectedCategory: "",
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  recommendedGames: [],
  selectedGames: [],
  negativeGames: [],
  suggestedQueries: [],
  toggleAddGame: (game) => {
    if (
      get()
        .selectedGames.map((g) => g.id)
        .includes(game.id)
    ) {
      set((state) => ({
        selectedGames: state.selectedGames.filter((g) => g.id !== game.id),
      }));
    } else {
      set((state) => ({
        selectedGames: [...state.selectedGames, game],
      }));
    }
  },
  toggleAddNeg: (game) => {
    if (
      get()
        .negativeGames.map((g) => g.id)
        .includes(game.id)
    ) {
      set((state) => ({
        negativeGames: state.negativeGames.filter((g) => g.id !== game.id),
      }));
    } else {
      set((state) => ({
        negativeGames: [...state.negativeGames, game],
      }));
    }
  },
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
  getRecommendedGames: async () => {
    const recommendations = await getRecommendations({
      games: get().selectedGames.map((g) => g.tracking_id),
      negativeGames: get().negativeGames.map((g) => g.tracking_id),
    });
    set(() => ({
      recommendedGames: recommendations,
    }));
  },
}));
