import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Chunk } from "@/lib/types";
import { useGameState } from "@/lib/gameState";
import { GameModal } from "./GameModal";
import { IconStar, IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Cross1Icon, HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";

export function GameCard({
  game,
  recommended,
}: {
  game: Chunk;
  recommended?: boolean;
}) {
  const { addGame, addNeg, selectedGames } = useGameState((state) => ({
    addGame: state.addGame,
    addNeg: state.addNeg,
    selectedGames: state.selectedGames,
  }));

  return (
    <Dialog>
      <div className="flex border-2 rounded-md h-20 hover:bg">
        <img
          src={game.metadata?.header_image}
          className="h-full rounded-t-lg"
          alt="Game Cover Art"
        />
        <div className="flex px-2 py-0.5 gap-3 items-stretch w-full">
          <div className="w-full">
            <p className="text-lg font-bold">{game.metadata?.name}</p>
            {!recommended &&
              <div className="flex">
                <div className="flex w-full">
                  <div>
                    {game.metadata.metacritic_score ? (
                      <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-2">
                          <IconStar
                            className={cn({
                              "w-3 h-3 fill-primary": true,
                              "fill-muted stroke-muted-foreground":
                                game.metadata.metacritic_score < 20,
                            })}
                          />
                          <IconStar
                            className={cn({
                              "w-3 h-3 fill-primary": true,
                              "fill-muted stroke-muted-foreground":
                                game.metadata.metacritic_score < 40,
                            })}
                          />
                          <IconStar
                            className={cn({
                              "w-3 h-3 fill-primary": true,
                              "fill-muted stroke-muted-foreground":
                                game.metadata.metacritic_score < 60,
                            })}
                          />
                          <IconStar
                            className={cn({
                              "w-3 h-3 fill-primary": true,
                              "fill-muted stroke-muted-foreground":
                                game.metadata.metacritic_score < 80,
                            })}
                          />
                          <IconStar
                            className={cn({
                              "w-3 h-3 fill-primary": true,
                              "fill-muted stroke-muted-foreground":
                                game.metadata.metacritic_score < 95,
                            })}
                          />
                          <span className="text-sm text-muted-foreground">
                            {game.metadata.metacritic_score}%
                          </span>
                        </div>
                      </div>
                    ) : null}
                    {game.metadata.positive || game.metadata.negative ? (
                      <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <IconThumbUp className="w-3 h-3 fill-primary" />
                            <span className="text-sm text-muted-foreground">
                              {game.metadata.positive}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <IconThumbDown className="w-3 h-3 fill-primary" />
                            <span className="text-sm text-muted-foreground">
                              {game.metadata.negative}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center ml-3 gap-3">
                    {Object.entries(game.metadata?.tags).sort((a, b) => b[1] - a[1]).slice(0, 3).map((key) => (
                      <Badge className="bg-amber-600">
                        {key[0]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      Open
                    </Button>
                  </DialogTrigger>
                  <Button onClick={() => addGame(game)}>
                    {!!selectedGames.find(
                      (g) => g.tracking_id == game.tracking_id) &&
                      <HeartFilledIcon />
                    }
                    {!selectedGames.find(
                      (g) => g.tracking_id == game.tracking_id) &&
                      <HeartIcon />
                    }
                  </Button>
                  <Button onClick={() => addNeg(game)}>
                    <Cross1Icon />
                  </Button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      <GameModal game={game} recommended={recommended} />
    </Dialog>
  );
}
