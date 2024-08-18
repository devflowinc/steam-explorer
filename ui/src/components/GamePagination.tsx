import { useGameState } from "@/lib/gameState";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export const GamePagination = () => {
  const { page, setPage, availablePages } = useGameState((state) => ({
    page: state.page,
    setPage: state.setPage,
    availablePages: state.availablePages,
  }));

  return (
    <Pagination>
      <PaginationContent>
        {page > 1 ? (
          <>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => setPage(page - 1)}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer"
                onClick={() => setPage(page - 1)}
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          </>
        ) : null}
        <PaginationItem>
          <PaginationLink isActive>{page}</PaginationLink>
        </PaginationItem>
        {page < availablePages ? (
          <PaginationItem>
            <PaginationLink
              className="cursor-pointer"
              onClick={() => setPage(page + 1)}
            >
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        ) : null}

        {page !== availablePages ? (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer"
                onClick={() => setPage(availablePages)}
                isActive={page === availablePages}
              >
                {availablePages}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() => setPage(page + 1)}
              />
            </PaginationItem>
          </>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
};
