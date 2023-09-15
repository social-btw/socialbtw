import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'

const competitionName = 'Utility'
const scores = [{ name: "John", score: 10 }]

const originalEnv = { ...process.env };

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_COMPETITION_NAME: competitionName,
  };
})

afterAll(() => {
  process.env = { ...originalEnv };
});

describe('Home Component', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(scores)
      })
    );
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches scores from /api and passes it to Table', async () => {

    render(<Home />);

    await screen.findByText(competitionName)

    expect(mockFetch).toHaveBeenCalledWith('/api')
  });

  it("renders table with the fetched scores", async () => {
    render(<Home />);

    await waitFor(() => screen.getByText("John"));

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
