import { useEffect, useState, useRef } from "react";

export const KEY = "1798675f";

export const useMovies = (result, callback) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const searchAmount = useRef(0);
  useEffect(() => {
    callback?.();
    // 1.create a instance
    const controller = new AbortController();
    async function movieFetch() {
      if (result !== "") {
        try {
          setIsLoading(true);
          // 2.connect signal to fetch
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${result}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Something went wrong");
          searchAmount.current++;
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setErrorMsg("");

          setMovies(data.Search);
        } catch (e) {
          setMovies([]);
          if (e.name !== "AbortError") setErrorMsg(e.message);
        } finally {
          //try 和 catch 最终都会执行的逻辑
          movies.length > 0 && setErrorMsg("");
          setIsLoading(false);
        }
      } else {
        setMovies([]);
        setErrorMsg("");
      }
    }
    movieFetch();
    // movieDetailCloseHandler();
    return function () {
      // 3.clean up
      controller.abort();
    };
  }, [result, movies.length, callback]);
  return {
    movies,
    isLoading,
    errorMsg,
    searchAmount: searchAmount.current,
  };
};
