import { GameCard } from "@/components/GameCard";
import { Loading } from "@/components/Loading";
import { useGameState } from "@/lib/gameState";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
export const Recs = () => {
  const { getRecommendedGames, recommendedGames, isLoading, selectedGames } = useGameState(
    (state) => ({
      getRecommendedGames: state.getRecommendedGames,
      selectedGames: state.selectedGames,
      recommendedGames: state.recommendedGames,
      isLoading: state.isLoading,
    })
  );

  useEffect(() => {
    if (selectedGames.length > 0) {
      getRecommendedGames(selectedGames.map((game) => {
        return game.tracking_id
      }));
    }
  }, [selectedGames]);

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex justify-center items-center mt-12 col-span-4">
          <Loading />
        </div>
      ) : recommendedGames.length ? (
        recommendedGames.map((r) => (
          <div className="max-w-sm">
              <GameCard recommended key={r.tracking_id} game={r}></GameCard>
          </div>
        ))
      ) : (
        <p>No games found</p>
      )}
    </div>
  );
};
