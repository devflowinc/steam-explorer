import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chunk } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { AsyncImage } from "loadable-image";
import { useGameState } from "@/lib/gameState";
import { cn } from "@/lib/utils";

export function GameCard({
  game,
  recommended,
}: {
  game: Chunk;
  recommended?: boolean;
}) {
  const { addGame, selectedGames } = useGameState((state) => ({
    addGame: state.addGame,
    selectedGames: state.selectedGames,
  }));
  return (
    <Card className="w-full max-w-sm bg-card text-card-foreground shadow-lg">
      <div className="relative">
        <Carousel>
          <CarouselContent>
            {game.metadata.screenshots.map((image) => (
              <CarouselItem key={image}>
                <AsyncImage
                  src={image}
                  className="w-full h-[300px] object-cover rounded-t-lg"
                  alt="Game Cover Art"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-primary-foreground text-sm font-medium">
          {[
            game.metadata.windows && "Windows",
            game.metadata.linux && "Linux",
            game.metadata.mac && "Mac",
          ]
            .filter((a) => a)
            .join(", ")}
        </div>
        {game.metadata.metacritic_score > 0 ? (
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
        ) : null}
      </div>
      <CardContent className="p-6 space-y-4 flex flex-col justify-between">
        <div>
          <a href={game.link} target="_blank" className="text-2xl font-bold">
            {game.metadata.name}
          </a>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {game.metadata.about_the_game || game.metadata.detailed_description}
          </p>
          <div className="flex items-center gap-2 mt-2 justify-between">
            <span className="text-2xl font-bold">${game.metadata.price}</span>
            <span className="text-muted-foreground text-sm">
              {game.metadata.genres.join(", ")}
            </span>
          </div>
          <div className="text-muted-foreground text-sm mt-2">
            Release Date: {game.metadata.release_date}
          </div>
        </div>
        {!recommended ? (
          <div className="flex gap-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => addGame(game)}
              disabled={
                !!selectedGames.find(
                  (g) => g.tracking_id === game.tracking_id
                ) || selectedGames.length > 9
              }
            >
              Add Game
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
