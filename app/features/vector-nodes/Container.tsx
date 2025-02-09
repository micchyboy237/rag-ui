// Update app/features/vector-nodes/Container.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useQueryNodes } from "~/hooks/useQueryNodes";
import { useQueryCache } from "~/hooks/useQueryCache";
import { Filter, QueryOptions } from "./types";
import { SearchForm } from "./SearchForm";
import { Results } from "./Results";
import { QueryResults } from "./QueryResults";
import "./styles.css";

// const DEFAULT_SELECTED_MODES = ["fusion", "deeplake", "graph_nx"];
const DEFAULT_SELECTED_MODES = ["fusion"];

export const Container: React.FC = () => {
  const [query, setQuery] = useState("");
  const [modes, setModes] = useState<string[]>(DEFAULT_SELECTED_MODES);
  const [queryFilters, setQueryFilters] = useState<Partial<QueryOptions>>(null);
  const { queryCache, storeQuery, removeQuery } = useQueryCache();

  const formatFilters = (
    queryFilters: Array<Filter>
  ): Partial<QueryOptions> => {
    return queryFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {});
  };

  const handleSearchNodes = (query: string, filters: Array<Filter>) => {
    const updatedQuery = query.trim();
    if (updatedQuery) {
      const formattedFilters = formatFilters(filters);

      setQuery(updatedQuery);
      setQueryFilters(formattedFilters);
    }
  };

  const handleStoreQuery = () => {
    const updatedQuery = query.trim();
    if (updatedQuery) {
      storeQuery(updatedQuery, queryFilters || {});
    }
  };

  // useEffect(() => {
  //   let timeout;
  //   if (query.trim()) {
  //     timeout = setTimeout(() => {
  //       queryNodes.run(query, queryFilters);
  //     }, 400);
  //   }
  //   return () => {
  //     clearTimeout(timeout);
  //     queryNodes.cancel();
  //   };
  // }, [query, queryFilters]);

  // useEffect(() => {
  //   const allModes = [
  //     ...new Set(queryCache.map(({ filters }) => filters.mode)),
  //   ];
  //   setModes(allModes);
  // }, [queryCache.length]);

  return (
    <div className="p-4">
      <SearchForm query={query} onSearch={handleSearchNodes} />

      <button onClick={handleStoreQuery} className="add-button mt-2">
        Store Query
      </button>

      <div className="query-cache mt-4">
        <h3>Stored Queries</h3>
        <ul>
          {queryCache.map(({ query, filters }) => (
            <li key={query + JSON.stringify(filters)} className="list-items">
              <span
                onClick={() =>
                  handleSearchNodes(
                    query,
                    Object.entries(filters || {}).map(([key, value]) => ({
                      key,
                      value,
                    }))
                  )
                }
                className="cursor-pointer hover:underline"
              >
                {query} {filters && `(${JSON.stringify(filters)})`}
              </span>
              <button
                onClick={() => removeQuery(query, filters)}
                className="remove-button"
              >
                X
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* {!!query.trim() && ( */}
      <QueryResults query={query} queryFilters={queryFilters} modes={modes} />
      {/* )} */}
    </div>
  );
};
