import { useGameState } from "@/lib/gameState";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const SelectedGames = () => {
  const navigate = useNavigate();
  const { selectedGames, clearSelectedGames } = useGameState((state) => ({
    selectedGames: state.selectedGames,
    clearSelectedGames: state.clearSelectedGames,
  }));
  return (
    <div className="fixed bottom-0 w-full left-0 bg-background py-8">
      <div className="container flex items-center justify-between">
        <div className="flex flex-col">
          Games Selected
          <ul className="grid grid-cols-2 gap-2 mt-2">
            {selectedGames?.length ? (
              selectedGames.map((g) => (
                <li
                  className="text-xs text-muted-foreground"
                  key={g.tracking_id}
                >
                  {g.metadata.name}
                </li>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                Select some games to get started
              </span>
            )}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            disabled={!selectedGames.length}
            onClick={() => navigate("/recs")}
          >
            Get Recommendations
          </Button>
          <Button variant="outline" onClick={clearSelectedGames}>
            Clear Choices
          </Button>
        </div>
      </div>
    </div>
  );
};
