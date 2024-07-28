import { Chunk } from "@/lib/types";
import { calculateSteamApprovalPercentage, cn } from "@/lib/utils";
import { TooltipTrigger, Tooltip, TooltipContent } from "./ui/tooltip";

export const GameScore = ({ game }: { game: Chunk }) => {
  return (
    <Tooltip>
      {game.metadata.metacritic_score > 0 ? (
        <>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            {game.metadata.metacritic_score + "  %"} on Metacritic
          </TooltipContent>
        </>
      ) : (
        <>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            {calculateSteamApprovalPercentage(game)} % on steam
          </TooltipContent>
        </>
      )}
    </Tooltip>
  );
};
