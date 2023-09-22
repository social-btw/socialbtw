import { GetCompetitionDetailsResponse, PlayerScore, ScoreTally } from "@/lib/types";
import { WOMClient } from "@wise-old-man/utils";

const client = new WOMClient({
  apiKey: process.env.WOM_KEY,
  userAgent: process.env.DISCORD_NAME
});

/**
 * Takes the response body from a GetCompetitionDetails API request and returns an array of PlayerScores
 * @param response - API response to GET /competitions/:id endpoint
 * @param multiplier - when tallying the final aggregate score, by what factor are points from the comp worth more
 * @param limit - if present only the return the first results up to this amount
 * @returns Promise of an array of PlayerScores containing `name` and `score`
 */
const parseScores = async (response: GetCompetitionDetailsResponse, multiplier = 1, limit?: number): Promise<PlayerScore[]> => {
  return response.participations.map((participation) => {
    return {
      name: participation.player.displayName,
      score: participation.progress.gained * multiplier
    }
  }).slice(0, limit)
}

/**
 * Takes a ScoreTally (ex: `{ playerOne: 4, playerTwo: 6 }` ) and returns a sorted array of PlayerScores
 * @param scoreTally - Hash table with player name as the key, and the summed score as the value
 * @returns Sorted array of PlayerScores
 */
const sortScores = (scoreTally: ScoreTally): PlayerScore[] => {
  let sortable = [];

  for (var player in scoreTally) {
    sortable.push({ name: player, score: scoreTally[player] });
  }

  sortable.sort(function (a, b) {
    return b.score - a.score;
  });

  return sortable;
}

/**
 * Fetches a single competitions details from the WOM API
 * @param id - ID of the competition to fetch scores for
 * @param limit - if present only the return the first results up to this amount
 * @returns Promise of an array of PlayerScores containing `name` and `score`
 */
export const getCompetition = async (id: number, limit?: number): Promise<PlayerScore[]> => {
  const response: GetCompetitionDetailsResponse = await client.competitions.getCompetitionDetails(id);

  return parseScores(response, 1, limit);
}

/**
 * Fetches all competition details from the WOM API
 * @param limit if present only the return the first results up to this amount
 * @returns Promise of an array of PlayerScores containing `name` and `score`
 */
export const fetchAllCompetitions = async (limit?: number): Promise<PlayerScore[]> => {
  const competitionFetches: Promise<PlayerScore[]>[] = []

  process.env.NEXT_PUBLIC_COMPETITION_SKILLS!.split(',').forEach(skill => {
    const competition = process.env[`NEXT_PUBLIC_${skill.toUpperCase()}`]!
    const [competitionId, _multiplier] = competition.split(',')

    const multiplier = _multiplier ? parseInt(_multiplier) : undefined

    const compFetch = client.competitions.getCompetitionDetails(parseInt(competitionId)).then((response: GetCompetitionDetailsResponse) => {
      return parseScores(response, multiplier);
    })

    competitionFetches.push(compFetch);
  })

  return Promise.all(competitionFetches).then(allScores => {
    const scoreTally: ScoreTally = {};

    allScores.forEach(compScores => {
      compScores.forEach(score => {
        const currentScore = scoreTally[score.name] || 0;

        scoreTally[score.name] = currentScore + score.score;
      })
    })

    return sortScores(scoreTally).slice(0, limit);
  })
}
