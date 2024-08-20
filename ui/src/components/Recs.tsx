import { GameCard } from "@/components/GameCard";
import { useGameState } from "@/lib/gameState";
import { useEffect } from "react";
import { GamesSelectedModal } from "./GamesSelectedModal";
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
    <div className="flex flex-col gap-4 md:bg-slate-900 rounded-lg md:p-3 max-h-[400px] overflow-auto md:max-h-max order-1 md:order-2">
      <div className="font-bold text-2xl hidden md:block">
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
