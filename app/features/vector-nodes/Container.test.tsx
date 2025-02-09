import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Container } from "./Container";
import { useQueryNodes } from "~/hooks/useQueryNodes";

jest.mock("~/hooks/useQueryNodes");

describe("Container", () => {
  it("displays loading and then results", async () => {
    const mockRun = jest.fn();
    const mockData = [{ id: 1, name: "Node 1" }];
    (useQueryNodes as jest.Mock).mockReturnValue({
      run: mockRun,
      data: mockData,
      loading: false,
      error: null,
    });

    render(<Container />);
    fireEvent.change(screen.getByPlaceholderText("Search for nodes..."), {
      target: { value: "Node 1" },
    });

    expect(mockRun).toHaveBeenCalledWith("Node 1");

    await waitFor(() => screen.getByText("Node 1"));
    expect(screen.getByText("Node 1")).toBeInTheDocument();
  });

  it("displays error message when fetching fails", async () => {
    const mockRun = jest.fn();
    const mockError = new Error("Fetch error");
    (useQueryNodes as jest.Mock).mockReturnValue({
      run: mockRun,
      data: [],
      loading: false,
      error: mockError,
    });

    render(<Container />);
    fireEvent.change(screen.getByPlaceholderText("Search for nodes..."), {
      target: { value: "Node 1" },
    });

    expect(mockRun).toHaveBeenCalledWith("Node 1");

    await waitFor(() => screen.getByText("Error: Fetch error"));
    expect(screen.getByText("Error: Fetch error")).toBeInTheDocument();
  });
});
