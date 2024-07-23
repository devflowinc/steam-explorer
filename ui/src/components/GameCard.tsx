import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGameState } from "@/lib/gameState";
import { Badge } from "./ui/badge";
import { AsyncImage } from "loadable-image";
import { IconBrandWindows, IconBrandApple } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Chunk } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Systems } from "./Systems";

export const GameCard = ({
  game,
  recommended,
}: {
  game: Chunk;
  recommended: boolean;
}) => {
  const { addGame, selectedGames } = useGameState((state) => ({
    addGame: state.addGame,
    selectedGames: state.selectedGames,
  }));
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <a href={game.link} target="_blank">
            {game.metadata.name}
          </a>
          <Systems metadata={game.metadata} />
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          {game.metadata.release_date}
          <span>
            {game.metadata.metacritic_score > 0
              ? game.metadata.metacritic_score + "  %"
              : null}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel>
          <CarouselContent>
            {game.metadata.screenshots.map((image) => (
              <CarouselItem key={image}>
                <AsyncImage className="w-full h-52" src={image} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex gap-2 flex-wrap mt-4">
          {game.metadata.genres.map((g) => (
            <Badge variant={"secondary"}>{g}</Badge>
          ))}
        </div>
      </CardContent>
      {!recommended ? (
        <CardFooter className="block">
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => addGame(game)}
            disabled={
              !!selectedGames.find((g) => g.tracking_id === game.tracking_id) ||
              selectedGames.length > 9
            }
          >
            Add Game
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
