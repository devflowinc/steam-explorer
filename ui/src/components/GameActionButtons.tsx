import { useGameState } from "@/lib/gameState";
import { Button } from "./ui/button";
import { Chunk } from "@/lib/types";
import {
  IconHeart,
  IconHeartFilled,
  IconThumbDown,
  IconThumbDownFilled,
} from "@tabler/icons-react";

export const GameActionButtons = ({ game }: { game: Chunk }) => {
  const { toggleAddGame, toggleAddNeg, negativeGames, selectedGames } =
    useGameState((state) => ({
      toggleAddGame: state.toggleAddGame,
      negativeGames: state.negativeGames,
      toggleAddNeg: state.toggleAddNeg,
      selectedGames: state.selectedGames,
    }));

  return (
    <>
      <Button
        disabled={
          !!negativeGames.find((g) => g.tracking_id == game.tracking_id)
        }
        className="w-full sm:w-auto"
        onClick={(e) => {
          e.stopPropagation();
          toggleAddGame(game);
        }}
      >
        {!selectedGames.find((g) => g.tracking_id == game.tracking_id) ? (
          <IconHeart />
        ) : (
          <IconHeartFilled />
        )}
      </Button>
      <Button
        variant={"secondary"}
        disabled={
          !!selectedGames.find((g) => g.tracking_id == game.tracking_id)
        }
        className="w-full sm:w-auto"
        onClick={(e) => {
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
