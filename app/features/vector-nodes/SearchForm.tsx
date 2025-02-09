import React, { useState, useEffect } from "react";
import { SearchInput } from "~/components/search/SearchInput";
import { Filters } from "./filters/Filters";
import { Filter } from "./types";
import { DEFAULT_FILTER_OPTIONS } from "./config";
import { FaFilter } from "react-icons/fa";

type SearchFormProps = {
  onSearch: (query: string, queryFilters: Array<Filter>) => void;
};

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [queryFilters, setQueryFilters] = useState<Array<Filter>>(
    DEFAULT_FILTER_OPTIONS
  );
  const [filtersVisible, setFiltersVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, queryFilters);
  };

  useEffect(() => {
    onSearch(query, queryFilters);
  }, [query, queryFilters]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <div className="relative">
        <SearchInput
          placeholder="Search..."
          className="w-full"
          onChange={setQuery}
        />
        <button
          type="button"
          className="absolute right-16 top-1/2 transform -translate-y-1/2"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <FaFilter size={20} />
        </button>
      </div>
      {filtersVisible && (
        <div className="absolute w-full bg-white mt-2 z-10">
          <Filters filters={queryFilters} setFilters={setQueryFilters} />
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="search-button bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Search Nodes
        </button>
        <button
          type="button"
          onClick={() => setQueryFilters(DEFAULT_FILTER_OPTIONS)}
          className="reset-button bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Reset Filters
        </button>
      </div>
    </form>
  );
};
