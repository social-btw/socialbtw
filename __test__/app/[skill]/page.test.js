import '@testing-library/jest-dom'
import { render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/[skill]/page";

jest.mock('../../../lib/wom', () => {
  return {
    getCompetition: jest.fn(() => [{ name: "John", score: 10 }])
  }
});

const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_COMPETITION_NAME: 'Utility',
    NEXT_PUBLIC_COMPETITION_SKILLS: 'thieving,slayer',
    NEXT_PUBLIC_THEIVING: '23423',
    NEXT_PUBLIC_SLAYER: '23423',
  };
})

afterAll(() => {
  process.env = originalEnv;
});

describe("Skill Page", () => {
  it("fetches scores and renders table", async () => {
    const page = await Page({ params: { skill: 'thieving' } })
    render(page);

    await waitFor(() => screen.getByText("John"));

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("handles no competition ID", async () => {
    const page = await Page({ params: { skill: 'unknown' } })
    const { container } = render(page);

    expect(container).toBeEmptyDOMElement();
  });
});
