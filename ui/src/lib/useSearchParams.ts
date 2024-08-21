import { useSearchParams as useSearchParamsReactRouter } from "react-router-dom";
import { useGameState } from "./gameState";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export const useSearchParams = ({
  setQuery,
  runFirstSearch,
}: {
  setQuery: Dispatch<SetStateAction<string>>;
  runFirstSearch: any;
}) => {
  const [searchParams, setSearchParams] = useSearchParamsReactRouter();
  const { setMaxSteamRatio, setMinSteamRatio, setMinReviews, setPage } =
    useGameState((state) => state);
  const [loaded, setLoaded] = useState(false);

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
    runFirstSearch(search);
    setLoaded(true);
  }, []);

  return { setSearchParams, loaded };
};
