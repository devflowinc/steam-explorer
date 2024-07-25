import { useGameState } from "@/lib/gameState";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { IconX, IconXboxXFilled } from "@tabler/icons-react";

export const SelectedGames = () => {
  const navigate = useNavigate();
  const { selectedGames, clearSelectedGames, removeSelectedGame } =
    useGameState((state) => ({
      selectedGames: state.selectedGames,
      removeSelectedGame: state.removeSelectedGame,
      clearSelectedGames: state.clearSelectedGames,
    }));
  return (
    <div className="fixed bottom-0 w-full left-0 bg-background py-8">
      <div className="container flex items-center justify-between">
        <div className="flex flex-col">
          Games Selected
          <ul className="grid grid-cols-2 gap-2 mt-2">
            {selectedGames?.length ? (
              selectedGames.map((game) => (
                <li
                  className="text-xs flex gap-1 items-center text-muted-foreground"
                  key={game.tracking_id}
                >
                  {game.metadata.name}
                  <button onClick={() => removeSelectedGame(game.tracking_id)}>
                    <IconXboxXFilled className="w-3 hover:text-primary" />
                  </button>
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
            onClick={() =>
              navigate(
                `/recs?games=${selectedGames
                  .map((g) => g.tracking_id)
                  .join(",")}`
              )
            }
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
