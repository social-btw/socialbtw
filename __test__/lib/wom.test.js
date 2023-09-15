import {
  parseScores,
  sortScores,
  getCompetition,
  fetchAllCompetitions,
} from "@/lib/wom";

const competitionDetailsResponse = {
  participations: [
    {
      player: {
        displayName: 'Gnome Child'
      },
      progress: {
        gained: 10
      }
    },
    {
      player: {
        displayName: 'Brundt the Chieftain'
      },
      progress: {
        gained: 7
      }
    }
  ]
};

describe("WOM Utility Functions", () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(competitionDetailsResponse)
      })
    );
  });

  describe("parseScores", () => {
    it("should parse scores correctly", async () => {
      const result = await parseScores(competitionDetailsResponse);
      expect(result).toEqual([{ name: 'Gnome Child', score: 10 }, { name: 'Brundt the Chieftain', score: 7 }]);
    });

    it("should multiply scores if a multiplier is given", async () => {
      const result = await parseScores(competitionDetailsResponse, 3);
      expect(result).toEqual([{ name: 'Gnome Child', score: 30 }, { name: 'Brundt the Chieftain', score: 21 }]);
    });

    it("should limit responses if a limit is given", async () => {
      const result = await parseScores(competitionDetailsResponse, 1, 1);
      expect(result).toEqual([{ name: 'Gnome Child', score: 10 }]);
    });
  });

  describe("sortScores", () => {
    it("should sort scores correctly", () => {
      const scoreTally = {
        'Gnome Child': 8,
        'Brundt the Chieftain': 16,
        'Duke Horacio': 2
      };
      const result = sortScores(scoreTally);
      expect(result).toEqual([
        { name: 'Brundt the Chieftain', score: 16 },
        { name: 'Gnome Child', score: 8 },
        { name: 'Duke Horacio', score: 2 },
      ]);
    });
  });

  describe("fetching competition details", () => {
    jest.mock('@wise-old-man/utils', () => {
      return {
        __esModule: true,
        default: jest.fn().mockImplementation(function () {
          this.competitions = {
            getCompetitionDetails: jest.fn().mockResolvedValue(competitionDetailsResponse)
          };
        })
      };
    });

    let clientInstance;
    const MockedWOMClient = require('@wise-old-man/utils').default;

    beforeEach(() => {
      MockedWOMClient.mockClear();
      clientInstance = new MockedWOMClient();
    });

    describe("getCompetition", () => {
      it("should get a single competition", async () => {
        const competitionId = 123;

        const result = await getCompetition(competitionId, undefined, clientInstance);

        expect(clientInstance.competitions.getCompetitionDetails).toHaveBeenCalledWith(competitionId);
        expect(result).toEqual([
          { name: 'Gnome Child', score: 10 },
          { name: 'Brundt the Chieftain', score: 7 },
        ]);
      });

      it("should limit result if a limit is given", async () => {
        const competitionId = 123;
        const limit = 1

        const result = await getCompetition(competitionId, limit, clientInstance);

        expect(clientInstance.competitions.getCompetitionDetails).toHaveBeenCalledWith(competitionId);
        expect(result).toEqual([
          { name: 'Gnome Child', score: 10 },
        ]);
      });
    });

    describe("fetchAllCompetitions", () => {
      beforeAll(() => {
        process.env.NEXT_PUBLIC_COMPETITION_SKILLS = 'thieving,slayer'
      })

      it("fetches all competitions in Competition Skills env vars", async () => {
        await fetchAllCompetitions(undefined, clientInstance);

        expect(clientInstance.competitions.getCompetitionDetails).toHaveBeenCalledTimes(2);

        expect(clientInstance.competitions.getCompetitionDetails).toHaveBeenCalledWith(parseInt(process.env.NEXT_PUBLIC_THIEVING))
        expect(clientInstance.competitions.getCompetitionDetails).toHaveBeenCalledWith(parseInt(process.env.NEXT_PUBLIC_SLAYER))
      });

      it("returns an aggregate score from each competition", async () => {
        const result = await fetchAllCompetitions(undefined, clientInstance);

        // All response return Gnome Child: 10 and Brundt: 7, so scores are 10 + 10 and 7 + 7
        expect(result).toEqual([
          { name: 'Gnome Child', score: 20 },
          { name: 'Brundt the Chieftain', score: 14 },
        ]);
      });

      it("should limit result if a limit is given", async () => {
        const result = await fetchAllCompetitions(1, clientInstance);

        expect(result).toEqual([
          { name: 'Gnome Child', score: 20 }
        ]);
      });

      it("calcutes scores with multipliers", async () => {
        process.env.NEXT_PUBLIC_SLAYER = '55555,3'

        const result = await fetchAllCompetitions(undefined, clientInstance);

        // Scores are 10 + (10 * 3) and 7 + (7 * 3)
        expect(result).toEqual([
          { name: 'Gnome Child', score: 40 },
          { name: 'Brundt the Chieftain', score: 28 },
        ]);
      });
    });
  })
});
