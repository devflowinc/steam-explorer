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

type Filters = {
  showFree: boolean;
  minScore: number;
  maxScore: number;
  selectedCategory: string;
};

export const getGames = async ({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: Filters;
}) => {
  const categories = filters.selectedCategory
    ? {
        field: "tag_set",
        match_any: [filters.selectedCategory],
      }
    : null;

  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      query: searchTerm,
      limit: 30,
      filters: {
        jsonb_prefilter: false,
        must: [
          {
            field: "metadata.totalPositiveNegative",
            range: {
              gte: 50,
            },
          },
          categories,
        ].filter((a) => a),
      },
      search_type: "hybrid",
    }),
  };

  const data = await fetch(
    "https://api.trieve.ai/api/chunk/search",
    options
  ).then((response) => response.json());

  return (data.chunks as APIResponse[]).reduce(
    (acc: APIResponse[], curr: APIResponse) => {
      if (
        !acc.find((game) => game.chunk.tracking_id === curr.chunk.tracking_id)
      ) {
        acc.push(curr);
      }
      return acc;
    },
    []
  );
};

export const getFirstLoadGames = async () => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      page_size: 30,
      filters: {
        must: [
          {
            field: "metadata.totalPositiveNegative",
            range: {
              gte: 5000,
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
