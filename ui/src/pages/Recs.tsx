import { GameCard } from "@/components/GameCard";
import { getRecommendations } from "@/lib/api";
import { useGameState } from "@/lib/gameState";
import { Chunk } from "@/lib/types";
import { useEffect, useState } from "react";
export const Recs = () => {
  const [recommendations, setRecommendations] = useState<Chunk[]>([]);
  const { games } = useGameState((state) => ({
    addGame: state.addGame,
    games: state.games,
  }));

  const getRecommendedGames = async () => {
    const recommendations = await getRecommendations({
      games: games.map((g) => g.tracking_id),
    });
    setRecommendations(recommendations);
  };

  useEffect(() => {
    getRecommendedGames();
  }, []);

  return (
    <div className="container my-12">
      <div className="grid grid-cols-3 gap-4 mt-8">
        {recommendations?.map((r) => (
          <GameCard key={r.tracking_id} game={r}></GameCard>
        ))}
      </div>
    </div>
  );
};
