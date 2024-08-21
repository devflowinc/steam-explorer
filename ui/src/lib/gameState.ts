import { create } from "zustand";
import { APIResponse, Chunk } from "./types";
import {
  getChunkByTrackingID,
  getFirstLoadGames,
  getGames,
  getRecommendations,
  getSuggestedQueries,
} from "./api";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import { get, set, del } from "idb-keyval";

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface GameState {
  page: number;
  availablePages: number;
  selectedGames: Chunk[];
  negativeGames: Chunk[];
  minSteamRatio: number;
  maxSteamRatio: number;
  setMinSteamRatio: (value: number) => void;
  setMaxSteamRatio: (value: number) => void;
  toggleAddGame: (game: Chunk) => void;
  toggleAddNeg: (game: Chunk) => void;
  isLoading: boolean;
  shownGames: APIResponse[];
  getGamesForSearch: (term: string) => void;
  recommendedGames: Chunk[];
  getRecommendedGames: () => Promise<void>;
  clearSelectedGames: () => void;
  removeSelectedGame: (id: string) => void;
  suggestedQueries: string[];
  setPage: (page: number) => void;
  addUserSteamGames: (games: string[]) => Promise<void>;
  minReviews: number;
  setMinReviews: (value: number) => void;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      availablePages: 0,
      page: 1,
      minReviews: 5000,
      setMinReviews: (value) => set({ minReviews: value }),
      minSteamRatio: 0,
      maxSteamRatio: 100,
      setMinSteamRatio: (value) => set({ minSteamRatio: value }),
      setMaxSteamRatio: (value) => set({ maxSteamRatio: value }),
      setPage: (page) => set({ page }),
      recommendedGames: [],
      selectedGames: [],
      negativeGames: [],
      suggestedQueries: [],
      addUserSteamGames: async (games) => {
        const gamesFromTrieve = await Promise.all(
          games.map(async (gameID) => {
            const data = await getChunkByTrackingID(gameID);
            if (data.id) {
              return data;
            }
            return null;
          })
        );
        set((state) => ({
          selectedGames: [
            ...state.selectedGames,
            ...gamesFromTrieve.filter((g) => g),
          ].reduce((acc: Chunk[], curr: Chunk) => {
            if (!acc.find((game) => game.tracking_id === curr.tracking_id)) {
              acc.push(curr);
            }
            return acc;
          }, []),
        }));
      },
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
              filters: {
                minReviews: get().minReviews,
                maxScore: get().maxSteamRatio,
                minScore: get().minSteamRatio,
              },
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
            getFirstLoadGames({
              maxScore: get().maxSteamRatio,
              minScore: get().minSteamRatio,
              minReviews: get().minReviews,
            }),
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
          negativeGames: [],
          recommendedGames: []
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
    }),
    {
      name: "steam-explorer-trieve",
      partialize: (state) => ({
        negativeGames: state.negativeGames,
        selectedGames: state.selectedGames,
      }),
      storage: createJSONStorage(() => storage),
    }
  )
);
