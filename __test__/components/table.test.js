import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import Table from "@/components/table";

describe("Table", () => {
  it("renders scores in table", () => {
    const scores = [{ name: "John", score: 10 }];
    render(<Table scores={scores} title="Competition" />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<Table scores={null} title="Competition" />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
