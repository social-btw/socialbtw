const SETUP = {
  name: 'setup',
  description: 'Begin setting up a new Competition week',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'Competition name (ie Utility)',
      type: 3,
      required: true
    }
  ]
}

const ADD = {
  name: 'add',
  description: 'Add a WOM Comp ID to the current competition',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'Competition Skill Name',
      required: true,
      type: 3
    },
    {
      name: 'wom_id',
      description: 'WOM Comp ID',
      required: true,
      type: 4
    },
    {
      name: 'points_multiplier',
      description: 'Factor to multiply points from this skill by when calculating total score',
      type: 4
    }
  ]
}

const DEPLOY = {
  name: 'deploy',
  description: 'Deploy settings and begin the new Competition',
  type: 1
}

const discordApi = async (endpoint, options) => {
  const url = `https://discord.com/api/v10/${endpoint}`;

  if (options.body) options.body = JSON.stringify(options.body);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    ...options
  });

  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }

  return res;
}

const pushApplicationCommands = async (commands) => {
  const appId = process.env.DISCORD_APP_ID
  const endpoint = `applications/${appId}/commands`;

  try {
    await discordApi(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

pushApplicationCommands([SETUP, ADD, DEPLOY])
