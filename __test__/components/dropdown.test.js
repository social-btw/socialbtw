import { render, screen } from "@testing-library/react";
import Dropdown from "@/components/dropdown";

import '@testing-library/jest-dom'

const competitionName = 'Competition Name'

const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_COMPETITION_NAME: competitionName,
    NEXT_PUBLIC_COMPETITION_SKILLS: 'thieving,slayer'
  };
})

afterAll(() => {
  process.env = originalEnv;
});

describe("Dropdown", () => {
  it("renders options", () => {
    render(<Dropdown title={competitionName} />);

    expect(screen.getByText(competitionName)).toBeInTheDocument();
    expect(screen.getByText("Thieving")).toBeInTheDocument();
    expect(screen.getByText("Slayer")).toBeInTheDocument();
  });
});
