import { Chunk } from "./types";
import { apiHeaders } from "./utils";

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
      slim_chunks: true,
      strategy: "average_vector",
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
  const removeFree = !filters.showFree
    ? {
        field: "metadata.price",
        range: {
          gt: 0,
        },
      }
    : null;

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
      limit: 29,
      filters: {
        jsonb_prefilter: false,
        must: [
          {
            field: "metadata.metacritic_score",
            range: {
              gte: filters.minScore,
              lte: filters.maxScore,
            },
          },
          removeFree,
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

  return data.chunks;
};

export const getFirstLoadGames = async () => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      page_size: 29,
      filters: {
        must: [
          {
            field: "metadata.metacritic_score",
            range: {
              gte: 50,
            },
          },
        ],
      },
      sort_by: {
        direction: "desc",
        field: "metadata.metacritic_score",
      },
    }),
  };

  const data = await fetch(
    "https://api.trieve.ai/api/chunks/scroll",
    options
  ).then((response) => response.json());

  return data.chunks.map((chunk: Chunk) => ({ chunk }));
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
