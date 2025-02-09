import React, { useEffect, useMemo, useState } from "react";
import { useQueryLLM } from "~/hooks/useQueryLLM";
import { useQueryNodes } from "~/hooks/useQueryNodes";
import { Filter, QueryOptions } from "./types";

interface QueryResultsProps {
  query: string;
  queryFilters: Partial<QueryOptions>;
  modes: string[];
}

export const QueryResults: React.FC<QueryResultsProps> = ({
  query,
  queryFilters,
  modes,
}) => {
  return (
    <div className="mt-4">
      {modes.map((mode) => (
        <NodesResult
          key={mode}
          query={query}
          queryFilters={queryFilters}
          mode={mode}
        />
      ))}
    </div>
  );
};

const NodesResult: React.FC<{
  query: string;
  queryFilters: Partial<QueryOptions>;
  mode: string;
}> = ({ query, queryFilters, mode }) => {
  const { run, cancel, data, loading, error } = useQueryNodes();

  const data_json_str = JSON.stringify(data, null, 2);

  useEffect(() => {
    const updatedQuery = query.trim();
    if (updatedQuery) {
      run(updatedQuery, {
        ...queryFilters,
        mode,
      });
    }
  }, [query, queryFilters]);

  const contexts = useMemo(() => {
    return data.map((item) => item.text);
  }, [data]);

  return (
    <>
      <div className="mt-4 p-6 border rounded-lg shadow-md bg-white">
        {loading && (
          <div className="text-center text-blue-500">Loading results...</div>
        )}
        {error && (
          <div className="text-center text-red-500">{error.message}</div>
        )}
        {!loading && !error && data.length === 0 && (
          <div className="text-center text-gray-500">No results found.</div>
        )}
        {!loading && !error && data.length > 0 && (
          <div className="overflow-auto max-h-96">
            <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 font-mono">
              {data_json_str}
            </pre>
          </div>
        )}
      </div>

      <LLMResult
        key={mode}
        query={query}
        contexts={contexts}
        queryFilters={queryFilters}
        mode={mode}
      />
    </>
  );
};

const LLMResult: React.FC<{
  query: string;
  contexts: string[];
  queryFilters: Record<string, any>;
  mode: string;
}> = ({ query, contexts, queryFilters, mode }) => {
  const [showLLMSearch, setShowLLMSearch] = useState(false);

  const queryLLM = useQueryLLM();

  const handleSearchLLM = () => {
    setShowLLMSearch(true);
  };

  useEffect(() => {
    if (showLLMSearch && query && contexts.length) {
      queryLLM.run(query, {
        contexts,
        ...queryFilters,
        mode,
      });
    }
  }, [showLLMSearch, query, contexts, queryFilters, mode]);

  return (
    <>
      <button onClick={handleSearchLLM} className="search-button mt-2">
        Search LLM
      </button>
      <div className="p-4 border rounded-lg shadow-md bg-white mt-2">
        <h3 className="text-lg font-semibold">Mode: {mode}</h3>
        {queryLLM.loading && <p className="text-blue-500">Loading...</p>}
        {queryLLM.error && (
          <p className="text-red-500">{queryLLM.error.message}</p>
        )}
        {!queryLLM.error && queryLLM.data && (
          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 font-mono overflow-auto max-h-96">
            {queryLLM.data}
          </pre>
        )}
      </div>
    </>
  );
};
