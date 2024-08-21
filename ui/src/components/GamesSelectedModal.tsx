import { Chunk } from "@/lib/types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { GameCard } from "./GameCard";

export const GamesSelectedModal = ({
  games,
  disliked,
}: {
  disliked?: boolean;
  games: Chunk[];
}) => {
  return (
    <Button variant={"link"} className="p-0 pr-1 underline">
      <Dialog>
        <DialogTrigger>
          {games.length} {disliked ? "disliked" : "liked"} game
          {games.length !== 1 ? "s" : ""}
        </DialogTrigger>

        <DialogContent className="md:max-w-[800px] !max-h-[80vh]">
          <DialogHeader>{disliked ? "Disliked" : "Liked"} Games</DialogHeader>
          <div className="flex flex-col gap-4">
            {games.map((game) => (
              <GameCard game={game} key={game.tracking_id} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Button>
  );
};
