import {
  InteractionType,
  InteractionResponseType
} from 'discord-interactions';

import {
  setup,
  add,
  deploy
} from '../../util/vercel'

const verify = (request) => {
  const nacl = require('tweetnacl');

  const PUBLIC_KEY = process.env.DISCORD_APP_PUBLIC_KEY

  const headersList = request.headers

  const signature = headersList['x-signature-ed25519'];
  const timestamp = headersList['x-signature-timestamp'];
  const body = JSON.stringify(request.body)

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );
}

const setupComp = (name) => {
  const response = `Setting up new comp with name **${name}**`

  setup(name);

  return response;
}

const addSkill = (name, womId, pointsMultiplier) => {
  let response = `Adding skill **${name} (${womId})**`

  if(pointsMultiplier !== undefined) {
    response += ` with a multiplier of **${pointsMultiplier}**`
  }

  add(name, womId, pointsMultiplier)

  return response;
}

const updateMessage = async (updatedMessage, token) => {
  const appId = process.env.DISCORD_APP_ID
  const endpoint = `webhooks/${appId}/${token}/messages/@original`
  const body = JSON.stringify({
    content: updatedMessage
  })

  const headers = {
    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    'Content-Type': 'application/json; charset=UTF-8'
  }

  return fetch(`https://discord.com/api/v10/${endpoint}`, {
    body,
    headers,
    method: 'PATCH'
  })
}

const performAsyncDeploy = async (token) => {
  const body = JSON.stringify({
    token
  })

  fetch(`${process.env.HOSTNAME}/api/discord`, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    method: 'PUT',
    body
  })
}

const deployValues = async () => {
  const result = await deploy() ? 'Success :tada:' : 'Failure :crying_cat_face:';

  return `Deploying comp settings :rocket: ... ${result}`
}

export default async function handler(req, res) {
  // The initial interaction request from Discord
  if(req.method == 'POST') {
    const { type, data, token } = req.body;

    // Verify the request
    if (verify(req) == false) {
      return res.status(401).json({ error: 'Bad signature' })
    }
  
    if (type === InteractionType.PING) {
      return res.status(200).json({ type: InteractionResponseType.PONG });
    }
  
    // Commands
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name, options } = data;

      let response;
  
      switch(name) {
        case 'setup':
          response = setupComp(options[0].value)
          break;
        case 'add':
          const skillName = options.find(option => option.name === 'name').value
          const womId = options.find(option => option.name === 'wom_id').value
          const pointsMultiplier = options.find(option => option.name === 'points_multiplier')?.value
  
          response = addSkill(skillName, womId, pointsMultiplier)
          break;
        case 'deploy':
          await performAsyncDeploy(token);

          return res.status(200).json({
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
          });
      }
  
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: response
        }
      });
    }
  // Async deploy request 
  } else if(req.method == 'PUT') {
    const { token } = req.body

    if(token == undefined) {
      res.status(400).json({
        success: false
      });
    }

    const message = await deployValues();

    await updateMessage(message, token)
    .then(res => {
      console.log(res.status)
      return res.text()
    }).then(body => console.log(body))

    return res.status(200).json({
      success: true
    });
  }
}
