import { Chunk } from "./types";
import { apiHeaders } from "./utils";

export const getRecommendations = async ({ games }: { games: string[] }) => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      limit: 20,
      positive_tracking_ids: games,
      recommend_type: "semantic",
      slim_chunks: true,
      filters: {
        must: [
          {
            field: "metadata.positive",
            range: {
              gt: 10,
            },
          },
        ],
      },
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

  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      query: searchTerm,
      limit: 29,
      filters: {
        must: [
          {
            field: "metadata.positive",
            range: {
              gt: 10,
            },
          },
          {
            field: "metadata.metacritic_score",
            range: {
              gte: filters.minScore,
              lte: filters.maxScore,
            },
          },
          removeFree,
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
              gte: 90,
            },
          },
        ],
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
