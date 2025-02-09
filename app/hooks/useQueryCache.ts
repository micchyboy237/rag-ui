import { useState, useEffect } from "react";

const CACHE_KEY = "queryCache";

interface CachedQuery {
  query: string;
  filters: Record<string, any>;
}

export const useQueryCache = (maxSize = 5) => {
  const isBrowser = typeof window !== "undefined"; // Ensure we are in the browser
  const [queryCache, setQueryCache] = useState<CachedQuery[]>(() => {
    if (!isBrowser) return []; // Prevent localStorage access on the server
    const storedCache = localStorage.getItem(CACHE_KEY);
    return storedCache ? JSON.parse(storedCache) : [];
  });

  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(queryCache));
    }
  }, [queryCache, isBrowser]);

  const storeQuery = (query: string, filters: Record<string, any>) => {
    setQueryCache((prev) => {
      const newEntry = { query, filters };
      const newCache = [
        newEntry,
        ...prev.filter(
          (q) =>
            q.query !== query ||
            JSON.stringify(q.filters) !== JSON.stringify(filters)
        ),
      ].slice(0, maxSize);
      return newCache;
    });
  };

  const removeQuery = (
    queryToRemove: string,
    filtersToRemove: Record<string, any>
  ) => {
    setQueryCache((prev) =>
      prev.filter(
        (q) =>
          q.query !== queryToRemove ||
          JSON.stringify(q.filters) !== JSON.stringify(filtersToRemove)
      )
    );
  };

  return { queryCache, storeQuery, removeQuery };
};
