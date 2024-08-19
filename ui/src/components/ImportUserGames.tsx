import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { getUserGames } from "@/lib/api";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import { useGameState } from "@/lib/gameState";

type SteamGame = {
  appid: number;
  has_community_visible_stats: boolean;
  img_icon_url: string;
  name: string;
  playtime_forever: number;
};

export const ImportUserGames = () => {
  const addUserSteamGames = useGameState((state) => state.addUserSteamGames);
  const [open, setOpen] = useState(false);
  const [isAddingSteamGames, setIsAddingSteamGames] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [userGames, setUserGames] = useState<SteamGame[]>([]);
  const [shownGames, setShownUserGames] = useState<SteamGame[]>([]);

  const getGames = async () => {
    setIsLoading(true);
    const data = await getUserGames({ userId });
    setIsLoading(false);
    setUserGames(data.games);
    setShownUserGames(data.games);
  };

  const changeShownGames = (showAll: boolean) => {
    if (!showAll) {
      setShownUserGames(userGames);
    } else {
      setShownUserGames(
        userGames?.filter((game) => game.playtime_forever !== 0)
      );
    }
  };
  const addUserGames = async () => {
    setIsAddingSteamGames(true);
    await addUserSteamGames(shownGames.map((game) => game.appid.toString()));
    setIsAddingSteamGames(false);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Import your games</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Import your steam games</DialogTitle>
        <p>Text explaning user what to do</p>

        <div className="flex gap-2 items-center">
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Your Steam user id"
          ></Input>
          <Button disabled={!userId || loading} onClick={getGames}>
            Get my games
          </Button>
        </div>

        {shownGames?.length ? (
          <>
            <div>
              <h3>You have {shownGames.length} games on steam</h3>
              <div className="flex items-center space-x-2 my-2">
                <Checkbox id="onlyPlayed" onCheckedChange={changeShownGames} />
                <label
                  htmlFor="onlyPlayed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Only import games I have played
                </label>
              </div>
              <div className="">
                <ScrollArea className="h-[300px]">
                  {shownGames?.map((game) => (
                    <li
                      className="flex gap-1 mt-2 items-center"
                      key={game.appid}
                    >
                      <img src={game.img_icon_url} />
                      <p className="flex gap-1 items-center">
                        {game.name}
                        <span className="text-muted-foreground text-sm">
                          {game.playtime_forever} minutes played
                        </span>
                      </p>
                    </li>
                  ))}
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={addUserGames}
                disabled={!shownGames || isAddingSteamGames}
                className="w-full"
              >
                Import
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
