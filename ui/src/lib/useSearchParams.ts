import { useSearchParams as useSearchParamsReactRouter } from "react-router-dom";
import { useGameState } from "./gameState";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const useSearchParams = ({
  setQuery,
}: {
  setQuery: Dispatch<SetStateAction<string>>;
}) => {
  const [searchParams, setSearchParams] = useSearchParamsReactRouter();
  const [loaded, setLoaded] = useState(false);
  const { setMaxSteamRatio, setMinSteamRatio, setMinReviews, setPage } =
    useGameState((state) => state);

  useEffect(() => {
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const minReviews = searchParams.get("minReviews");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    minScore && setMinSteamRatio(parseInt(minScore));
    maxScore && setMaxSteamRatio(parseInt(maxScore));
    page && setPage(parseInt(page));
    search && setQuery(search);
    minReviews && setMinReviews(parseInt(minReviews));
    setLoaded(true);
  }, []);

  return { loaded, setSearchParams };
};
