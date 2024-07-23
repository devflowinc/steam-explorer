import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Loading } from "./components/Loading";
import { GameCard } from "./components/GameCard";
import { APIResponse, Chunk } from "./lib/types";
import { getGames } from "./lib/api";
import { SelectedGames } from "./components/SelectedGames";

export function App() {
  const [query, setQuery] = useState("");
  const debouncedSearchTerm = useDebounce(query, 300);
  const [shownGames, setShownGames] = useState<APIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getGamesForSearch = async () => {
    if (debouncedSearchTerm) {
      setIsLoading(true);
      await getGames({ searchTerm: debouncedSearchTerm }).then(setShownGames);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getGamesForSearch();
  }, [debouncedSearchTerm]);

  return (
    <div className="container my-12">
      <Input
        type="search"
        placeholder="Sonic"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid grid-cols-3 gap-4 mt-8">
        {!shownGames.length && !isLoading ? "Search for some games" : null}
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
