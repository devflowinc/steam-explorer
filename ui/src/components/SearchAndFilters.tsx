import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useGameState } from "@/lib/gameState";
import { useDebounce } from "@uidotdev/usehooks";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Combobox } from "./Combobox";

export const SearchAndFilters = () => {
  const [query, setQuery] = useState("");

  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const debouncedSearchTerm = useDebounce(query, 300);
  const {
    getGamesForSearch,
    suggestedQueries,
    selectedCategory,
    setSelectedCategory,
    recFromFilters,
    setRecFromFilters
  } = useGameState((state) => ({
    getGamesForSearch: state.getGamesForSearch,
    suggestedQueries: state.suggestedQueries,
    selectedCategory: state.selectedCategory,
    setSelectedCategory: state.setSelectedCategory,
    recFromFilters: state.recFromFilters,
    setRecFromFilters: state.setRecFromFilters
  }));

  useEffect(() => {
    getGamesForSearch(debouncedSearchTerm, {
      minScore,
      maxScore,
      selectedCategory,
    });
  }, [debouncedSearchTerm, minScore, maxScore, selectedCategory]);

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
      <div className="mt-4 sm:flex items-center justify-between gap-4">
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
        <div className="sm:flex inline-block items-center space-x-2 mr-2 sm:mr-0 mt-2 sm:mt-0">
          <Combobox
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
        <div className="sm:flex inline-block items-center space-x-2 ">
          <Checkbox
            id="free"
            checked={recFromFilters}
            onCheckedChange={(value) => setRecFromFilters(value as boolean)}
          />
          <label
            htmlFor="free"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Reccomend From Generes
          </label>
        </div>
      </div>
    </>
  );
};
