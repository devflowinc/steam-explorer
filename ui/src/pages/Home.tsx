import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Loading } from "../components/Loading";
import { GameCard } from "../components/GameCard";
import { Chunk } from "../lib/types";
import { SelectedGames } from "../components/SelectedGames";
import { useGameState } from "@/lib/gameState";

export function Home() {
  const [query, setQuery] = useState("");
  const debouncedSearchTerm = useDebounce(query, 300);
  const { shownGames, isLoading, getGamesForSearch } = useGameState(
    (state) => ({
      shownGames: state.shownGames,
      isLoading: state.isLoading,
      getGamesForSearch: state.getGamesForSearch,
    })
  );

  useEffect(() => {
    getGamesForSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="container my-12">
      <Input
        type="search"
        placeholder="Sonic"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-[12rem]">
        {!shownGames?.length && !isLoading ? "Search for some games" : null}
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
    </div>
  );
}
