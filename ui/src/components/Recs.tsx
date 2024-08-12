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
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="flex justify-center items-center mt-12 col-span-4">
          <Loading />
        </div>
      ) : recommendedGames.length ? (
        recommendedGames.map((r) => (
          <GameCard recommended key={r.tracking_id} game={r}></GameCard>
        ))
      ) : (
        <p>Press the heart on a game to add it to your liked games and </p>
      )}
    </div>
  );
};
