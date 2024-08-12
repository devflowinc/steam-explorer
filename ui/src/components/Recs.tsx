import { GameCard } from "@/components/GameCard";
import { Loading } from "@/components/Loading";
import { useGameState } from "@/lib/gameState";
import { useEffect } from "react";
export const Recs = () => {
  const {
    getRecommendedGames,
    recommendedGames,
    isLoading,
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
    <div className="flex flex-col gap-4 bg-slate-900 rounded-lg p-3">
      <div className="font-bold text-2xl">Recommended Games:</div>
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
