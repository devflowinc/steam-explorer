import { Loading } from "../components/Loading";
import { GameCard } from "../components/GameCard";
import { Chunk } from "../lib/types";
import { useGameState } from "@/lib/gameState";
import { Layout } from "@/components/Layout";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Recs } from "@/components/Recs";

export function Home() {
  const { shownGames, isLoading } = useGameState((state) => ({
    shownGames: state.shownGames,
    isLoading: state.isLoading,
  }));

  return (
    <Layout>
      <SearchAndFilters />
      <div className="sm:grid-cols-3 gap-4 mt-8 grid-cols-1 hidden sm:grid">
        <div className="sm:col-span-2 flex flex-col gap-4 order-2 sm:order-1">
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
        <Recs />
      </div>
      <Accordion
        type="multiple"
        className="w-full block sm:hidden"
        defaultValue={["search"]}
      >
        <AccordionItem value="recommended">
          <AccordionTrigger> Recommended Games</AccordionTrigger>
          <AccordionContent>
            <Recs />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="search">
          <AccordionTrigger>Search Results</AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <div className="flex justify-center items-center mt-12 col-span-4">
                <Loading />
              </div>
            ) : (
              shownGames?.map(({ chunk }: { chunk: Chunk }) => (
                <GameCard key={chunk.tracking_id} game={chunk} />
              ))
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Layout>
  );
}
