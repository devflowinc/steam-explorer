import { GameCard } from "@/components/GameCard";
import { useGameState } from "@/lib/gameState";
import { useEffect } from "react";
export const Recs = () => {
  const { getRecommendedGames, recommendedGames } = useGameState((state) => ({
    getRecommendedGames: state.getRecommendedGames,
    recommendedGames: state.recommendedGames,
  }));

  useEffect(() => {
    getRecommendedGames();
  }, []);

  return (
    <div className="container my-12">
      <div className="grid grid-cols-3 gap-4 mt-8">
        {recommendedGames?.map((r) => (
          <GameCard recommended key={r.tracking_id} game={r}></GameCard>
        ))}
      </div>
    </div>
  );
};
