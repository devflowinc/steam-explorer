import { APIResponse, Chunk } from "./types";
import { apiHeaders } from "./utils";

export const getChunkByTrackingID = async (id: string) => {
  const options = {
    method: "GET",
    headers: apiHeaders,
  };

  const chunk = await fetch(
    `https://api.trieve.ai/api/chunk/tracking_id/${id}`,
    options
  ).then((response) => response.json());

  return chunk;
};

export const getRecommendations = async ({
  games,
  negativeGames,
}: {
  games: string[];
  negativeGames: string[];
}) => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      limit: 20,
      positive_tracking_ids: games,
      ...(negativeGames.length && { negative_tracking_ids: negativeGames }),
      recommend_type: "semantic",
      filters: {
        must: [
          {
            field: "metadata.totalPositiveNegative",
            range: {
              gte: 50,
            },
          },
        ],
      },
      slim_chunks: true,
      strategy: "best_score",
    }),
  };

  const recs = await fetch(
    "https://api.trieve.ai/api/chunk/recommend",
    options
  ).then((response) => response.json());

  return recs;
};

export const getUserGames = async ({ userId }: { userId: string }) => {
  const data = await fetch(
    `http://localhost:5173/api/games?user=${userId}`
  ).then((rsp) => rsp.json());

  return data;
};

export const getGames = async ({
  searchTerm,
  page = 1,
  filters,
}: {
  searchTerm: string;
  page: number;
  filters: {
    minScore: number;
    maxScore: number;
    minReviews: number;
  };
}) => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      query: searchTerm,
      page_size: 18,
      page: page,
      get_total_pages: true,
      filters: {
        jsonb_prefilter: false,
        must: [
          {
            field: "metadata.totalPositiveNegative",
            range: {
              gte: filters.minReviews,
            },
          },
          {
            field: "metadata.positiveNegativeRatio",
            range: {
              gte: filters.minScore,
              lte: filters.maxScore,
            },
          },
        ],
      },
      search_type: "hybrid",
    }),
  };

  const data = await fetch(
    "https://api.trieve.ai/api/chunk/search",
    options
  ).then((response) => response.json());

  return {
    chunks: (data.chunks as APIResponse[]).reduce(
      (acc: APIResponse[], curr: APIResponse) => {
        if (
          !acc.find((game) => game.chunk.tracking_id === curr.chunk.tracking_id)
        ) {
          acc.push(curr);
        }
        return acc;
      },
      []
    ),
    pages: data.total_pages,
  };
};

export const getFirstLoadGames = async (filters: {
  minScore: number;
  minReviews: number;
  maxScore: number;
}) => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      page_size: 18,
      filters: {
        must: [
          {
            field: "metadata.totalPositiveNegative",
            range: {
              gte: filters.minReviews < 5000 ? 5000 : filters.minReviews,
            },
          },
          {
            field: "metadata.positiveNegativeRatio",
            range: {
              gte: filters.minScore,
              lte: filters.maxScore,
            },
          },
        ],
      },
      sort_by: {
        direction: "desc",
        field: "metadata.positiveNegativeRatio",
      },
    }),
  };

  const data = await fetch(
    "https://api.trieve.ai/api/chunks/scroll",
    options
  ).then((response) => response.json());

  return data.chunks
    .reduce((acc: Chunk[], curr: Chunk) => {
      if (!acc.find((game) => game.tracking_id === curr.tracking_id)) {
        acc.push(curr);
      }
      return acc;
    }, [])
    .map((chunk: Chunk) => ({ chunk }));
};

export const getSuggestedQueries = async ({ term }: { term: string }) => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      query: term,
    }),
  };

  const data = await fetch(
    "https://api.trieve.ai/api/chunk/suggestions",
    options
  ).then((response) => response.json());

  return data.queries.slice(0, 4);
};
