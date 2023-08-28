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

const deployValues = async () => {
  const result = await deploy() ? 'Success :tada:' : 'Failure :crying_cat_face:';

  return `Deploying comp settings :rocket: ... ${result}`
}

export default async function handler(req, res) {
  const { type, data } = req.body;

  if (verify(req) == false || req.method !== 'POST') {
    return res.status(401).json({ error: 'Bad signature' })
  }

  if (type === InteractionType.PING) {
    return res.status(200).json({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    console.log(data)

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
        response = await deployValues()
        break;
    }

    return res.status(200).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: response,
      },
    });
  }

  return res.status(200).json({ type: InteractionResponseType.PONG });
}
