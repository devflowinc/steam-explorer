import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useGameState } from "@/lib/gameState";
import { useDebounce } from "@uidotdev/usehooks";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";

export const SearchAndFilters = () => {
  const [query, setQuery] = useState("");
  const [showFree, setShowFree] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const debouncedSearchTerm = useDebounce(query, 300);
  const { getGamesForSearch, suggestedQueries } = useGameState((state) => ({
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
    <>
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
    </>
  );
};
