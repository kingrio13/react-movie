import { useState, useEffect } from "react";

const key = "33f10fa0";

export function useMovies(query) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [movies, setMovies] = useState([]);

  /**wew***/

  useEffect(() => {
    //callback?.();

    const controler = new AbortController();
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?s=${query}&apikey=${key}`,
          { query },
          { signal: controler.signal }
        );

        if (!res.ok) {
          throw new Error("Something Went Wrong with Fetching the Movies.");
        }

        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("Movie not Found");
        }

        setMovies(data.Search);
        setIsLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    fetchMovies();

    return function () {
      controler.abort();
    };
  }, [query]);

  return { isLoading, error, movies };
}
