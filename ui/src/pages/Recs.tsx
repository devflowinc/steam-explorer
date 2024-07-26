import { GameCard } from "@/components/GameCard";
import { Layout } from "@/components/Layout";
import { Loading } from "@/components/Loading";
import { useGameState } from "@/lib/gameState";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
export const Recs = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { getRecommendedGames, recommendedGames, isLoading } = useGameState(
    (state) => ({
      getRecommendedGames: state.getRecommendedGames,
      recommendedGames: state.recommendedGames,
      isLoading: state.isLoading,
    })
  );
  const gamesInUrl = new URLSearchParams(params).get("games");
  useEffect(() => {
    if (!gamesInUrl) {
      navigate("/");
    } else {
      getRecommendedGames(gamesInUrl);
    }
  }, []);
  if (!gamesInUrl) {
    navigate("/");
    return;
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-[12rem]">
        {isLoading ? (
          <div className="flex justify-center items-center mt-12 col-span-4">
            <Loading />
          </div>
        ) : recommendedGames[gamesInUrl]?.length ? (
          recommendedGames[gamesInUrl]?.map((r) => (
            <GameCard recommended key={r.tracking_id} game={r}></GameCard>
          ))
        ) : (
          <p>No games found</p>
        )}
      </div>
    </Layout>
  );
};
