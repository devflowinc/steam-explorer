import { Loading } from "../components/Loading";
import { GameCard } from "../components/GameCard";
import { Chunk } from "../lib/types";
import { SelectedGames } from "../components/SelectedGames";
import { useGameState } from "@/lib/gameState";
import { Layout } from "@/components/Layout";
import { SearchAndFilters } from "@/components/SearchAndFilters";

export function Home() {
  const { shownGames, isLoading } = useGameState((state) => ({
    shownGames: state.shownGames,
    isLoading: state.isLoading,
  }));

  return (
    <Layout>
      <SearchAndFilters />
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
