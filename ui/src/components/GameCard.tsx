import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Chunk } from "@/lib/types";
import { useGameState } from "@/lib/gameState";
import { GameModal } from "./GameModal";
import {
  IconCross,
  IconHeart,
  IconHeartFilled,
  IconStar,
  IconThumbDown,
  IconThumbDownFilled,
  IconThumbUp,
  IconX,
  IconXboxXFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Systems } from "./Systems";

const GameScore = ({ game }: { game: Chunk }) => (
  <div className="flex gap-4">
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
);

export function GameCard({
  game,
  recommended,
}: {
  game: Chunk;
  recommended?: boolean;
}) {
  const { toggleAddGame, toggleAddNeg, selectedGames, negativeGames } =
    useGameState((state) => ({
      toggleAddGame: state.toggleAddGame,
      toggleAddNeg: state.toggleAddNeg,
      selectedGames: state.selectedGames,
      negativeGames: state.negativeGames,
    }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex border-2 rounded-md h-28 hover:bg items-center gap-4 cursor-pointer relative">
          <div className="absolute top-1 rounded-sm left-1 bg-black/90">
            <div className="p-1">
              <Systems metadata={game.metadata} />
            </div>
          </div>
          <img
            src={game.metadata?.header_image}
            className="h-full rounded-l-md"
            alt="Game Cover Art"
          />

          <div className="flex px-2 py-0.5 items-stretch w-full flex-col gap-2">
            <p className="text-lg font-bold">{game.metadata?.name}</p>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <GameScore game={game} />
                <div className="flex items-center gap-3">
                  {Object.entries(game.metadata?.tags)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map((key) => (
                      <Badge className="bg-amber-600">{key[0]}</Badge>
                    ))}
                </div>
              </div>
              {!recommended && (
                <div className="flex space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAddGame(game);
                    }}
                  >
                    {!selectedGames.find(
                      (g) => g.tracking_id == game.tracking_id
                    ) ? (
                      <IconHeart />
                    ) : (
                      <IconHeartFilled />
                    )}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAddNeg(game);
                    }}
                  >
                    {!negativeGames.find(
                      (g) => g.tracking_id == game.tracking_id
                    ) ? (
                      <IconThumbDown />
                    ) : (
                      <IconThumbDownFilled />
                    )}
                  </Button>
                </div>
              )}{" "}
            </div>
          </div>
        </div>
      </DialogTrigger>
      <GameModal game={game} recommended={recommended} />
    </Dialog>
  );
}
