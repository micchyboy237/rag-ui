// app/components/SearchInput.tsx
import React, { InputHTMLAttributes } from "react";

type FilterOption = { value: string; label: string };
type InputPropsWithoutOnChange = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
>;
type SearchInputProps = InputPropsWithoutOnChange & {
  filters?: FilterOption[];
  onChange: (query: string) => void;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  className = "",
  onChange,
  ...rest
}) => {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      <input
        type="text"
        className={`border p-2 ${className}`}
        placeholder={placeholder}
        onChange={handleChange}
        {...rest} // Spread additional props here
      />
    </div>
  );
};
