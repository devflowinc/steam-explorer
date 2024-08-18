import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Chunk } from "@/lib/types";
import { GameModal } from "./GameModal";
import { IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Systems } from "./Systems";
import { GameActionButtons } from "./GameActionButtons";

const GameScore = ({
  game,
  recommended,
}: {
  game: Chunk;
  recommended?: boolean;
}) => (
  <div
    className={cn({
      "flex gap-4": !recommended,
    })}
  >
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="sm:flex border-2 rounded-md sm:max-h-28 hover:bg items-center gap-4 cursor-pointer relative max-w-full pb-4 sm:pb-0">
          <div className="absolute top-1 rounded-sm left-1 bg-black/90">
            <div className="p-1">
              <Systems metadata={game.metadata} />
            </div>
          </div>
          <img
            src={game.metadata?.header_image}
            className={cn({
              "sm:h-full sm:rounded-l-md rounded-t-md": !recommended,
              "sm:h-full sm:max-w-48": recommended,
            })}
            alt="Game Cover Art"
          />

          <div className="flex px-2 py-0.5 items-stretch w-full flex-col gap-2">
            <p className="text-lg font-bold line-clamp-2">
              {game.metadata?.name}
            </p>

            <div className="sm:flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <GameScore game={game} recommended={recommended} />
                {!recommended && (
                  <div className="flex items-center gap-3">
                    {Object.entries(game.metadata?.tags)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map((key) => (
                        <Badge className="bg-amber-600">{key[0]}</Badge>
                      ))}
                  </div>
                )}
              </div>
              {!recommended && (
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  <GameActionButtons game={game} />
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
