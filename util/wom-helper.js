const { WOMClient } = require('@wise-old-man/utils');

const client = new WOMClient({
  apiKey: process.env.WOM_KEY,
  userAgent: process.env.DISCORD_NAME
});

export const getCompetition = async (id, limit) => {
    const response = await client.competitions.getCompetitionDetails(id);

    return parseScores(response, limit);
}

export const parseScores = async (response, limit) => {
  return response.participations.map((player) => {
    return {
      name: player.player.displayName,
      score: player.progress.gained
    }
  }).slice(0, limit)
}


export const fetchAllCompetitions = async (limit) => {
  const competitionFetches = [];

  process.env.COMPETITION_SKILLS.split(',').forEach(skill => {
    const competitionId = process.env[skill.toUpperCase()];

    const compFetch = client.competitions.getCompetitionDetails(competitionId).then(response => {
      return parseScores(response);
    })

    competitionFetches.push(compFetch);
  })

  return Promise.all(competitionFetches).then(scores => {
    const scoreTally = {};

    scores.forEach(compScores => {
      compScores.forEach(score => {
        const currentScore = scoreTally[score.name] || 0;

        scoreTally[score.name] = currentScore + score.score;
      })
    })

    let sortable = [];
    for (var user in scoreTally) {
      sortable.push({ name: user, score: scoreTally[user] });
    }

    sortable.sort(function (a, b) {
      return b.score - a.score;
    });

    return sortable.slice(0, limit);
  })
}
