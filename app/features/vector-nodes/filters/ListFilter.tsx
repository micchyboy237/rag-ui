import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface ListFilterProps {
  filterName: string;
  value: string[];
  options: (string | number)[];
  onUpdate: (newList: string[]) => void;
}

export const ListFilter: React.FC<ListFilterProps> = ({
  filterName,
  value,
  options,
  onUpdate,
}) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() && !value.includes(input)) {
      onUpdate([...value, input.trim()]);
      setInput("");
    }
  };

  const handleRemove = (item: string) => {
    onUpdate(value.filter((v) => v !== item));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue && !value.includes(selectedValue)) {
      onUpdate([...value, selectedValue]);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <div className="flex items-center gap-3 mb-3">
        <select
          onChange={handleSelect}
          className="input-field border rounded-lg px-3 py-2"
          value=""
          defaultValue=""
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Custom value"
          className="input-field border rounded-lg px-3 py-2"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="add-button bg-blue-600 text-white p-2 rounded-lg flex items-center gap-1"
        >
          <FaPlus /> Add
        </button>
      </div>
      <ul className="list-items space-y-2">
        {value.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-2 bg-white rounded-lg shadow-md"
          >
            <span className="text-gray-800">{item}</span>
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="remove-button bg-red-500 text-white p-2 rounded-lg flex items-center gap-1"
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
