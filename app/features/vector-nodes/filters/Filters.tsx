import React from "react";
import { Filter } from "../types";
import { ListFilter } from "./ListFilter";
import { DEFAULT_FILTER_OPTIONS } from "../config";

interface FiltersProps {
  filters: Array<Filter>;
  setFilters: React.Dispatch<React.SetStateAction<Array<Filter>>>;
}

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.name === name
          ? {
              ...filter,
              value: type === "checkbox" ? checked : value,
            }
          : filter
      )
    );
  };

  return (
    <div className="form-container bg-white p-6 rounded-lg shadow-lg">
      {filters.map((filter) => (
        <div key={filter.name} className="mb-4">
          <label className="block text-md font-semibold mb-2">
            {filter.name}
          </label>
          {filter.type === "text" || filter.type === "number" ? (
            <input
              type={filter.type}
              name={filter.name}
              value={filter.value}
              onChange={handleInputChange}
              placeholder={filter.placeholder}
              className="input-field border rounded-lg px-3 py-2 w-full"
            />
          ) : filter.type === "select" ? (
            <select
              name={filter.name}
              value={filter.value}
              onChange={handleInputChange}
              className="input-field border rounded-lg px-3 py-2 w-full"
            >
              {filter.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : filter.type === "list" ? (
            <ListFilter
              filterName={filter.name}
              value={filter.value || []}
              options={filter.options || []}
              onUpdate={(newList) =>
                setFilters((prevFilters) =>
                  prevFilters.map((f) =>
                    f.name === filter.name ? { ...f, value: newList } : f
                  )
                )
              }
            />
          ) : null}
        </div>
      ))}
    </div>
  );
};
