import React, { useEffect, useState } from "react";
import { useQueryNodes } from "~/hooks/useQueryNodes";
import { useQueryCache } from "~/hooks/useQueryCache";
import { Filter, QueryOptions } from "./types";
import { SearchForm } from "./SearchForm";
import { Results } from "./Results";
import "./styles.css";

export const Container: React.FC = () => {
  const [query, setQuery] = useState("");
  const [queryFilters, setQueryFilters] = useState<Partial<QueryOptions>>(null);
  const { queryCache, storeQuery, removeQuery } = useQueryCache();
  const queryNodes = useQueryNodes();

  const formatFilters = (
    queryFilters: Array<Filter>
  ): Partial<QueryOptions> => {
    return queryFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {});
  };

  const handleSearch = (query: string, filters: Array<Filter>) => {
    const formattedFilters = formatFilters(filters);
    setQuery(query);
    setQueryFilters(formattedFilters);
  };

  const handleStoreQuery = () => {
    storeQuery(query, queryFilters || {});
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      queryNodes.run(query, queryFilters);
    }, 400);
    return () => {
      clearTimeout(timeout);
      queryNodes.cancel();
    };
  }, [query, queryFilters]);

  return (
    <div className="p-4">
      <SearchForm onSearch={handleSearch} />
      <button onClick={handleStoreQuery} className="add-button mt-2">
        Store Query
      </button>
      <Results
        data={queryNodes.data}
        loading={queryNodes.loading}
        error={queryNodes.error}
      />
      <div className="query-cache mt-4">
        <h3>Stored Queries</h3>
        <ul>
          {queryCache.map(({ query, filters }) => (
            <li key={query + JSON.stringify(filters)} className="list-items">
              <span
                onClick={() =>
                  handleSearch(
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
    </div>
  );
};
