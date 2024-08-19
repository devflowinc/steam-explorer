import { create } from "zustand";
import { APIResponse, Chunk } from "./types";
import {
  getFirstLoadGames,
  getGames,
  getRecommendations,
  getSuggestedQueries,
} from "./api";
import { persist } from "zustand/middleware";

interface GameState {
  page: number;
  availablePages: number;
  selectedGames: Chunk[];
  negativeGames: Chunk[];
  toggleAddGame: (game: Chunk) => void;
  toggleAddNeg: (game: Chunk) => void;
  isLoading: boolean;
  shownGames: APIResponse[];
  getGamesForSearch: (term: string, filters: any) => void;
  recommendedGames: Chunk[];
  getRecommendedGames: (useFilters: boolean) => Promise<void>;
  clearSelectedGames: () => void;
  removeSelectedGame: (id: string) => void;
  suggestedQueries: string[];
  setPage: (page: number) => void;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      availablePages: 0,
      page: 1,
      setPage: (page) => set({ page }),
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
      getGamesForSearch: async (term: string) => {
        set(() => ({ isLoading: true }));
        if (term) {
          const [games, suggestedQueries] = await Promise.all([
            getGames({
              searchTerm: term,
              page: get().page,
            }),
            getSuggestedQueries({ term }),
          ]);

          set(() => ({
            shownGames: games.chunks,
            availablePages: games.pages,
            suggestedQueries,
            isLoading: false,
          }));
        } else {
          const [games, suggestedQueries] = await Promise.all([
            getFirstLoadGames(),
            getSuggestedQueries({ term: "Openworld fighting game" }),
          ]);

          set(() => ({
            shownGames: games,
            suggestedQueries: suggestedQueries,
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
      getRecommendedGames: async (useFilters: boolean) => {
        if (useFilters) {
          const recommendations = await getRecommendations({
            games: get().selectedGames.map((g) => g.tracking_id),
            negativeGames: get().negativeGames.map((g) => g.tracking_id),
          });
          set(() => ({
            recommendedGames: recommendations,
          }));
        }
      },
    }),
    {
      // @ts-expect-error
      partialize: (state) => ({
        negativeGames: state.negativeGames,
        selectedGames: state.selectedGames,
      }),
    }
  )
);
