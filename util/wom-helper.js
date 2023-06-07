const { WOMClient } = require('@wise-old-man/utils');

const client = new WOMClient({
  apiKey: process.env.WOM_KEY,
  userAgent: process.env.DISCORD_NAME
});

export const getCompetition = async (id, limit) => {
    const response = await client.competitions.getCompetitionDetails(id);

    let scores = response.participations.map((player) => {
      return {
        name: player.player.displayName,
        score: player.progress.gained
      }
    }).slice(0, limit)

    return scores
}

export const scores = async (id) => {

}

export const getAllCompetitions = async (limit) => {
  process.env.COMPETITION_SKILLS.split(',').forEach(skill => {
    const competitionId = process.env[skill.toUpperCase()];

    getCompetition
  })
  
}
