import { useGameState } from "@/lib/gameState";
import { Badge } from "./ui/badge";
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

export const GameCard = ({ game }: { game: Chunk }) => {
  const { addGame, games } = useGameState((state) => ({
    addGame: state.addGame,
    games: state.games,
  }));
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>
          {" "}
          <a href={game.link} target="_blank">
            {game.metadata.name}
          </a>
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
                <img className="max-w-full" src={image} />
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
      <CardFooter className="block">
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => addGame(game)}
          disabled={
            !!games.find((g) => g.tracking_id === game.tracking_id) ||
            games.length > 9
          }
        >
          Add Game
        </Button>
      </CardFooter>
    </Card>
  );
};
