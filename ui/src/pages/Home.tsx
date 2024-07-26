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

export function Home() {
  const [query, setQuery] = useState("");
  const [showFree, setShowFree] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const debouncedSearchTerm = useDebounce(query, 300);
  const { shownGames, isLoading, getGamesForSearch } = useGameState(
    (state) => ({
      shownGames: state.shownGames,
      isLoading: state.isLoading,
      getGamesForSearch: state.getGamesForSearch,
    })
  );

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
        placeholder="Sonic"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
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
        {!shownGames?.length && !isLoading ? (
          <div className="flex flex-col items-center gap-2 justify-center col-span-7 mt-12">
            <h2 className="font-bold text-xl mb-4">Search for some games</h2>
            <h3 className="text-balance font-semibold">
              Add them to your selected games
            </h3>
            <h3 className="text-balance font-semibold">
              We will give you some gaming suggestions ✨
            </h3>
          </div>
        ) : null}
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
