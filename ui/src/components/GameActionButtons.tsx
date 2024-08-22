import { useGameState } from "@/lib/gameState";
import { Button } from "./ui/button";
import { Chunk } from "@/lib/types";
import {
  IconHeart,
  IconHeartFilled,
  IconThumbDown,
  IconThumbDownFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    plausible: any;
  }
}

window.plausible = window.plausible || {};

export const GameActionButtons = ({ game }: { game: Chunk }) => {
  const { toggleAddGame, toggleAddNeg, negativeGames, selectedGames } =
    useGameState((state) => ({
      toggleAddGame: state.toggleAddGame,
      negativeGames: state.negativeGames,
      toggleAddNeg: state.toggleAddNeg,
      selectedGames: state.selectedGames,
    }));

  const gameLiked = selectedGames.find(
    (g) => g.tracking_id == game.tracking_id
  );
  const gameDisliked = negativeGames.find(
    (g) => g.tracking_id == game.tracking_id
  );

  return (
    <>
      <Button
        disabled={
          !!negativeGames.find((g) => g.tracking_id == game.tracking_id)
        }
        className={cn("w-full md:w-auto")}
        onClick={(e) => {
          !!gameLiked &&
            window.plausible("Game Liked", {
              props: {
                name: game.metadata.name,
                tracking_id: game.tracking_id,
              },
            });
          e.stopPropagation();
          toggleAddGame(game);
        }}
      >
        {!gameLiked ? <IconHeart /> : <IconHeartFilled />}
      </Button>
      <Button
        variant={"secondary"}
        disabled={
          !!selectedGames.find((g) => g.tracking_id == game.tracking_id)
        }
        className={cn("w-full md:w-auto")}
        onClick={(e) => {
          !!gameDisliked &&
            window.plausible("Game Disliked", {
              props: {
                name: game.metadata.name,
                tracking_id: game.tracking_id,
              },
            });
          e.stopPropagation();
          toggleAddNeg(game);
        }}
      >
        {!negativeGames.find((g) => g.tracking_id == game.tracking_id) ? (
          <IconThumbDown />
        ) : (
          <IconThumbDownFilled />
        )}
      </Button>
    </>
  );
};
