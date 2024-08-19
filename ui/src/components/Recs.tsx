import { GameCard } from "@/components/GameCard";
import { useGameState } from "@/lib/gameState";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Chunk } from "@/lib/types";
export const Recs = () => {
  const {
    getRecommendedGames,
    recommendedGames,
    selectedGames,
    negativeGames,
  } = useGameState((state) => ({
    getRecommendedGames: state.getRecommendedGames,
    selectedGames: state.selectedGames,
    recommendedGames: state.recommendedGames,
    isLoading: state.isLoading,
    negativeGames: state.negativeGames,
  }));

  useEffect(() => {
    if (selectedGames.length > 0 || negativeGames.length > 0) {
      getRecommendedGames();
    }
  }, [selectedGames, negativeGames]);

  return (
    <div className="flex flex-col gap-4 sm:bg-slate-900 rounded-lg sm:p-3 max-h-[400px] overflow-auto sm:max-h-max order-1 sm:order-2">
      <div className="font-bold text-2xl hidden sm:block">
        Recommended Games:
      </div>
      {recommendedGames.length ? (
        <>
          <p className="-mt-3 mb-4 text-muted-foreground text-sm">
            Out of <GamesSelectedModal games={selectedGames} /> and{" "}
            <GamesSelectedModal games={negativeGames} disliked />
          </p>
        </>
      ) : null}
      {recommendedGames.length ? (
        recommendedGames.map((r) => (
          <GameCard recommended key={r.tracking_id} game={r}></GameCard>
        ))
      ) : (
        <>
          <p className="text-center pb-8">
            Select some games to get recommendations for new games to play
          </p>
        </>
      )}
    </div>
  );
};

const GamesSelectedModal = ({
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

        <DialogContent className="sm:max-w-[800px] !max-h-[80vh]">
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
