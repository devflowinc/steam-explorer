import { Chunk } from "@/lib/types";
import { calculateSteamApprovalPercentage, cn } from "@/lib/utils";

export const GameScore = ({ game }: { game: Chunk }) => {
  return game.metadata.metacritic_score > 0 ? (
    <div
      className={cn({
        "absolute top-4 right-4 px-3 py-1 rounded-full text-primary-foreground text-sm font-medium bg-red-500":
          true,
        "bg-yellow-500": game.metadata.metacritic_score >= 50,
        "bg-green-500": game.metadata.metacritic_score >= 70,
      })}
    >
      {game.metadata.metacritic_score + "  %"}
    </div>
  ) : (
    <div
      className={cn({
        "absolute top-4 right-4 px-3 py-1 rounded-full text-primary-foreground text-sm font-medium bg-red-500":
          true,
        "bg-yellow-500": calculateSteamApprovalPercentage(game) >= 50,
        "bg-green-500": calculateSteamApprovalPercentage(game) >= 70,
      })}
    >
      {calculateSteamApprovalPercentage(game)} %
    </div>
  );
};
