import { create } from "zustand";
import { getUserGames } from "./api";
import { useGameState } from "./gameState";

export type SteamGame = {
  appid: number;
  has_community_visible_stats: boolean;
  img_icon_url: string;
  name: string;
  playtime_forever: number;
};

interface GameState {
  open: boolean;
  setOpen: (value: boolean) => void;
  isAddingSteamGames: boolean;
  setIsAddingSteamGames: (value: boolean) => void;
  userId: string;
  setUserId: (value: string) => void;
  isGettingSteamGames: boolean;
  setIsGettingSteamGames: (value: boolean) => void;
  userGames: SteamGame[];
  setUserGames: (games: SteamGame[]) => void;
  shownGames: SteamGame[];
  setShownUserGames: (games: SteamGame[]) => void;
  error: boolean | string;
  setError: (value: boolean) => void;
  getGames: () => Promise<void>;
  addUserGames: () => Promise<void>;
}

export const useSteamImportState = create<GameState>()((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  userId: "",
  setUserId: (userId) => set({ userId }),
  isAddingSteamGames: false,
  setIsAddingSteamGames: (isAddingSteamGames) => set({ isAddingSteamGames }),
  isGettingSteamGames: false,
  setIsGettingSteamGames: (isGettingSteamGames) => set({ isGettingSteamGames }),
  error: false,
  setError: (error) => set({ error }),
  setShownUserGames: (games) => set({ shownGames: games }),
  shownGames: [],
  setUserGames: (games) => set({ userGames: games }),
  userGames: [],
  addUserGames: async () => {
    set({ isAddingSteamGames: true });
    await useGameState
      .getState()
      .addUserSteamGames(get().shownGames.map((game) => game.appid.toString()));
    set({
      isAddingSteamGames: false,
      open: false,
    });
  },
  getGames: async () => {
    try {
      get().setIsGettingSteamGames(true);
      const data = await getUserGames({ userId: get().userId });
      if (data.error) set({ error: data.error });
      set({
        userGames: data.games,
        shownGames: data.games,
      });
    } catch {
      set({ error: true });
    } finally {
      set({ isGettingSteamGames: false });
    }
  },
}));
