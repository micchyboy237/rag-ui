import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "./SearchInput";
import "@testing-library/jest-dom";

describe("SearchInput Component", () => {
  it("calls onChange with the entered query", () => {
    const handleChange = jest.fn();
    render(
      <SearchInput
        placeholder="Search..."
        onChange={handleChange}
        filters={[{ value: "category1", label: "Category 1" }]}
      />
    );
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Test Query" } });
    expect(handleChange).toHaveBeenCalledWith("Test Query");
  });
});
