import { useGameState } from "@/lib/gameState";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const SelectedGames = () => {
  const navigate = useNavigate();
  const { games } = useGameState((state) => ({
    games: state.games,
  }));

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
        <Button disabled={!games.length} onClick={() => navigate("/recs")}>
          Get Recommendations
        </Button>
      </div>
    </div>
  );
};
