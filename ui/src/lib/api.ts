import { apiHeaders } from "./utils";

export const getRecommendations = async ({ games }: { games: string[] }) => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      limit: 10,
      positive_tracking_ids: games,
      recommend_type: "semantic",
      slim_chunks: true,
      filters: {
        must: [
          {
            field: "metadata.metacritic_score",
            range: {
              gt: 0,
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

export const getGames = async ({ searchTerm }: { searchTerm: string }) => {
  const options = {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify({
      query: searchTerm,
      filters: {
        must: [
          {
            field: "metadata.metacritic_score",
            range: {
              gt: 0,
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

  return data.chunks;
};
