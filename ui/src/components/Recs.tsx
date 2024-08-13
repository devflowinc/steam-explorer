import { GameCard } from "@/components/GameCard";
import { useGameState } from "@/lib/gameState";
import { useEffect } from "react";
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
    if (selectedGames.length > 0) {
      getRecommendedGames();
    }
  }, [selectedGames, negativeGames]);

  return (
    <div className="flex flex-col gap-4 sm:bg-slate-900 rounded-lg sm:p-3 max-h-[400px] overflow-auto sm:max-h-max order-1 sm:order-2">
      <div className="font-bold text-2xl hidden sm:block">
        Recommended Games:
      </div>
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
