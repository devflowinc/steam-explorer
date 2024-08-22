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
        className={cn(
          "w-full md:w-auto",
          !gameLiked && `plausible-event-name=Game+Liked+${game.tracking_id}`
        )}
        onClick={(e) => {
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
        className={cn(
          "w-full md:w-auto",
          !gameDisliked &&
            `plausible-event-name=Game+Disliked+${game.tracking_id}`
        )}
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
