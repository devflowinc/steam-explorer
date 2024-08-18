import { IconStar, IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { format } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Chunk } from "@/lib/types";
import { AsyncImage } from "loadable-image";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { GameActionButtons } from "./GameActionButtons";

export const GameModal = ({
  game,
  recommended,
}: {
  game: Chunk;
  recommended?: boolean;
}) => {
  return (
    <DialogContent className="sm:max-w-[800px]">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div>
          <Carousel>
            <CarouselContent>
              {game.metadata.screenshots?.map((image, i) => (
                <CarouselItem key={i}>
                  <AsyncImage
                    src={image}
                    className="rounded-lg w-full aspect-[3/4] object-cover"
                    alt="Game Cover Art"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <a href={game.link} target="_blank">
            <Button className="mt-4 w-full">See on Steam</Button>
          </a>
          <a
            href={`https://steamdb.info/app/${game.tracking_id}/charts/`}
            target="_blank"
          >
            <Button variant={"outline"} className="w-full mt-2">
              See on SteamDB
            </Button>
          </a>
          {!recommended ? (
            <div className="mt-4 grid grid-cols-2 space-x-2">
              <GameActionButtons game={game} />
            </div>
          ) : null}
        </div>
        <div className="grid gap-4">
          <div>
            <DialogTitle className="text-3xl font-bold">
              {game.metadata.name}
            </DialogTitle>
            <p className="text-muted-foreground">
              {game.metadata.genres?.join(", ")}
            </p>
          </div>
          {game.metadata.metacritic_score ? (
            <a
              className="flex gap-2 items-center"
              href={game.metadata.metacritic_url}
              target="_blank"
            >
              <p className="text-muted-foreground text-sm">Metacritic Score</p>
              <div className="flex items-center gap-2">
                <IconStar
                  className={cn({
                    "w-5 h-5 fill-primary": true,
                    "fill-muted stroke-muted-foreground":
                      game.metadata.metacritic_score < 20,
                  })}
                />
                <IconStar
                  className={cn({
                    "w-5 h-5 fill-primary": true,
                    "fill-muted stroke-muted-foreground":
                      game.metadata.metacritic_score < 40,
                  })}
                />
                <IconStar
                  className={cn({
                    "w-5 h-5 fill-primary": true,
                    "fill-muted stroke-muted-foreground":
                      game.metadata.metacritic_score < 60,
                  })}
                />
                <IconStar
                  className={cn({
                    "w-5 h-5 fill-primary": true,
                    "fill-muted stroke-muted-foreground":
                      game.metadata.metacritic_score < 80,
                  })}
                />
                <IconStar
                  className={cn({
                    "w-5 h-5 fill-primary": true,
                    "fill-muted stroke-muted-foreground":
                      game.metadata.metacritic_score < 95,
                  })}
                />
                <span className="text-sm text-muted-foreground">
                  {game.metadata.metacritic_score}%
                </span>
              </div>
            </a>
          ) : null}
          {game.metadata.positive || game.metadata.negative ? (
            <div className="flex gap-2 items-center">
              <p className="text-muted-foreground text-sm">Steam Reviews</p>
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <IconThumbUp className="w-5 h-5 fill-primary" />
                    <span className="text-sm text-muted-foreground">
                      {game.metadata.positive}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconThumbDown className="w-5 h-5 fill-primary" />
                    <span className="text-sm text-muted-foreground">
                      {game.metadata.negative}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {game.metadata.about_the_game ||
          game.metadata.detailed_description ? (
            <div className="grid gap-2">
              <p className="text-lg font-medium">Description</p>
              <ScrollArea className="h-[300px]">
                <p className="text-sm leading-relaxed">
                  {game.metadata.about_the_game ||
                    game.metadata.detailed_description}
                </p>
              </ScrollArea>
            </div>
          ) : null}
          <div className="grid gap-2">
            <p className="text-lg font-medium">Details</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="grid gap-1">
                <p className="text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">${game.metadata.price}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-muted-foreground">Release Date</p>
                <p>{format(game.metadata.release_date, "dd/MM/yyyy")}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-muted-foreground">Developer</p>
                <p>{game.metadata.developers?.join(", ")}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-muted-foreground">Publisher</p>
                <p>{game.metadata.publishers?.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};
