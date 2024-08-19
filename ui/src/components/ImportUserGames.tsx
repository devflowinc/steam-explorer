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
  const [userId, setUserId] = useState("");
  const [isAddingSteamGames, setIsAddingSteamGames] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [userGames, setUserGames] = useState<SteamGame[]>([]);
  const [shownGames, setShownUserGames] = useState<SteamGame[]>([]);
  const [error, setError] = useState(false);

  const getGames = async () => {
    try {
      setIsLoading(true);
      const data = await getUserGames({ userId });

      setUserGames(data.games);
      setShownUserGames(data.games);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
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
        <p>
          To get your games, we need your Steam ID, this is different then your
          username. To view your Steam ID:
        </p>
        <ul className="list-disc pl-4 space-y-2 mb-2">
          <li>
            In the Steam desktop application or website, select your Steam
            username in the top right corner of the screen.
          </li>
          <li>Select 'Account details'</li>
          <li>Your Steam ID can be found below your Steam username.</li>
        </ul>
        <form
          className="flex gap-2 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            getGames();
          }}
        >
          <Input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Your Steam user id"
          ></Input>
          <Button disabled={!userId || loading} type="submit">
            Get my games
          </Button>
        </form>
        {error ? (
          <p className="text-red-500 text-xs -mt-2">
            There was an error fetching your games, is your steam id correct?
          </p>
        ) : null}
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
