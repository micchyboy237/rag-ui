import React, { useEffect, useState } from "react";
import { useQueryNodes } from "~/hooks/useQueryNodes";
import { useQueryCache } from "~/hooks/useQueryCache";
import { Filter, QueryOptions } from "./types";
import { SearchForm } from "./SearchForm";
import { Results } from "./Results";
import "./styles.css";
import { useQueryLLM } from "~/hooks/useQueryLLM";

export const Container: React.FC = () => {
  const [query, setQuery] = useState("");
  const [queryFilters, setQueryFilters] = useState<Partial<QueryOptions>>(null);
  const { queryCache, storeQuery, removeQuery } = useQueryCache();
  const queryNodes = useQueryNodes();
  const queryLLM = useQueryLLM();

  const formatFilters = (
    queryFilters: Array<Filter>
  ): Partial<QueryOptions> => {
    return queryFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {});
  };

  const handleSearchNodes = (query: string, filters: Array<Filter>) => {
    const formattedFilters = formatFilters(filters);
    setQuery(query);
    setQueryFilters(formattedFilters);
  };

  const handleSearchLLM = () => {
    if (queryNodes.data.length > 0) {
      const contexts = queryNodes.data.map((item) => item.text);
      queryLLM.run(query, {
        contexts,
        ...queryFilters,
      });
    }
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
      <SearchForm onSearch={handleSearchNodes} />
      {queryNodes.data.length > 0 && (
        <>
          <button onClick={handleStoreQuery} className="add-button mt-2">
            Store Query
          </button>
          <button onClick={handleSearchLLM} className="search-button mt-2">
            Search LLM
          </button>
        </>
      )}

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

      {queryLLM.loading && <p>Loading...</p>}
      <div className="streamed-results mt-4">{queryLLM.data}</div>

      <Results
        data={queryNodes.data}
        loading={queryNodes.loading}
        error={queryNodes.error}
      />
    </div>
  );
};
