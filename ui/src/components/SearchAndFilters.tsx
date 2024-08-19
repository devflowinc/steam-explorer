import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useGameState } from "@/lib/gameState";
import { useDebounce } from "@uidotdev/usehooks";
import { Slider } from "./ui/slider";
import { useSearchParams } from "react-router-dom";

export const SearchAndFilters = () => {
  const [query, setQuery] = useState("");

  const debouncedSearchTerm = useDebounce(query, 300);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loaded, hasLoaded] = useState(false);
  const {
    getGamesForSearch,
    suggestedQueries,
    page,
    minSteamRatio,
    maxSteamRatio,
    setMaxSteamRatio,
    setMinSteamRatio,
    setMinReviews,
    minReviews,
  } = useGameState((state) => state);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setQuery(search);
      hasLoaded(true);
    } else {
      hasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      getGamesForSearch(debouncedSearchTerm);
      setSearchParams({
        search: query,
        minScore: minSteamRatio.toString(),
        maxScore: maxSteamRatio.toString(),
      });
    }
  }, [
    debouncedSearchTerm,
    minSteamRatio,
    maxSteamRatio,
    page,
    minReviews,
    loaded,
  ]);

  useEffect(() => {
    if (page) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  return (
    <>
      <Input
        type="search"
        placeholder="Type a keyword or describe the game you'd love to try out..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {suggestedQueries.length ? (
        <div className=" gap-4 items-center hidden sm:flex">
          <span className="text-sm text-muted-foreground">
            Suggested queries:
          </span>
          <ul className="flex items-center gap-2 my-4">
            {suggestedQueries.map((query) => (
              <li key={query}>
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
      <div className="mt-4 sm:flex items-center justify-between gap-4">
        <div className="sm:flex grow gap-4">
          <Slider
            minStepsBetweenThumbs={1}
            className="max-w-sm"
            defaultValue={[minSteamRatio, maxSteamRatio]}
            max={100}
            step={1}
            onValueCommit={([min, max]) => {
              setMinSteamRatio(min);
              setMaxSteamRatio(max);
            }}
          />
          <label
            htmlFor="free"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Steam positive review ratio ({minSteamRatio}-{maxSteamRatio})
          </label>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex grow gap-4">
          <Slider
            className="max-w-sm"
            defaultValue={[minReviews]}
            max={10000}
            step={100}
            onValueCommit={([min]) => setMinReviews(min)}
          />
          <label
            htmlFor="free"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Minimum reviews ({minReviews})
          </label>
        </div>
      </div>
    </>
  );
};
