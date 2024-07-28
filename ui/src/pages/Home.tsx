import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Loading } from "../components/Loading";
import { GameCard } from "../components/GameCard";
import { Chunk } from "../lib/types";
import { SelectedGames } from "../components/SelectedGames";
import { useGameState } from "@/lib/gameState";
import { Layout } from "@/components/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export function Home() {
  const [query, setQuery] = useState("");
  const [showFree, setShowFree] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const debouncedSearchTerm = useDebounce(query, 300);
  const { shownGames, isLoading, getGamesForSearch, suggestedQueries } =
    useGameState((state) => ({
      shownGames: state.shownGames,
      isLoading: state.isLoading,
      getGamesForSearch: state.getGamesForSearch,
      suggestedQueries: state.suggestedQueries,
    }));

  useEffect(() => {
    getGamesForSearch(debouncedSearchTerm, {
      showFree,
      minScore,
      maxScore,
    });
  }, [debouncedSearchTerm, showFree, minScore, maxScore]);

  return (
    <Layout>
      <Input
        type="search"
        placeholder="Type a keyword or describe the game you'd love to try out..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {suggestedQueries.length ? (
        <div className="flex gap-4 items-center">
          <span className="text-sm text-muted-foreground">
            Suggested queries:
          </span>
          <ul className="flex items-center gap-2 my-4">
            {suggestedQueries.map((query) => (
              <li>
                <Badge
                  className="cursor-pointer"
                  onClick={() => setQuery(query)}
                  variant={"secondary"}
                >
                  {query}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex grow gap-4">
          <Slider
            minStepsBetweenThumbs={1}
            className="max-w-sm"
            defaultValue={[minScore, maxScore]}
            max={100}
            step={1}
            onValueCommit={([min, max]) => {
              setMinScore(min);
              setMaxScore(max);
            }}
          />
          <label
            htmlFor="free"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Metacritic Score ({minScore}-{maxScore})
          </label>
        </div>

        <div className="flex items-center space-x-2 ">
          <Checkbox
            id="free"
            checked={showFree}
            onCheckedChange={(value) => setShowFree(value as boolean)}
          />
          <label
            htmlFor="free"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show free games
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-[12rem]">
        {isLoading ? (
          <div className="flex justify-center items-center mt-12 col-span-4">
            <Loading />
          </div>
        ) : (
          shownGames?.map(({ chunk }: { chunk: Chunk }) => (
            <GameCard key={chunk.tracking_id} game={chunk} />
          ))
        )}
      </div>

      <SelectedGames />
    </Layout>
  );
}
