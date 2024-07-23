import { getRecommendations } from "@/lib/api";
import { useGameState } from "@/lib/gameState";
import { Button } from "./ui/button";

export const SelectedGames = () => {
  const { games } = useGameState((state) => ({
    addGame: state.addGame,
    games: state.games,
  }));

  const getRecommendedGames = async () => {
    const a = await getRecommendations({
      games: games.map((g) => g.tracking_id),
    });
  };

  return (
    <div className="fixed bottom-0 w-full left-0 bg-background py-8">
      <div className="container flex items-center justify-between">
        <div className="flex flex-col">
          Games Selected
          <ul className="grid grid-cols-2 gap-2 mt-2">
            {games.map((g) => (
              <li className="text-xs text-muted-foreground">
                {g.metadata.name}
              </li>
            ))}
          </ul>
        </div>
        <Button disabled={!games.length} onClick={getRecommendedGames}>
          Get Recommendations
        </Button>
      </div>
    </div>
  );
};
