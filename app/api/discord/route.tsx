import {
  InteractionType,
  InteractionResponseType,
  verifyKey
} from 'discord-interactions';

import { createHmac } from 'crypto';

import {
  setupComp as vercelSetup,
  addComp as vercelAdd,
  deployComp as vercelDeploy
} from '@/lib/vercel'
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers'
import { AsyncWebhookData, DiscordWebhookData, DiscordWebhookUpdateBody } from '@/lib/types';

/**
 * Generate an HMAC to sign requests to ensure authenticity
 * @param body 
 * @returns 
 */
const generateHMAC = (body: string): string => {
  if(process.env.SECRET === undefined) {
    throw new Error('Secret cannot be undefined')
  }

  const hash = createHmac('sha256', process.env.SECRET)
    .update(body)
    .digest('hex');
  return hash
}

/**
 * Verify the incoming webhook as originating from Discord
 * @param body - request body
 * @returns - the authenticity of the request
 */
const verify = (body: string): boolean => {
  const publicKey = process.env.DISCORD_APP_PUBLIC_KEY!

  const headersList = headers()

  const signature = headersList.get('x-signature-ed25519');
  const timestamp = headersList.get('x-signature-timestamp');

  if(!signature || !timestamp) {
    return false;
  }

  return verifyKey(body, signature, timestamp, publicKey)
}

/**
 * Setup a new competition
 * @param name - Competition name
 * @returns - Discord command response
 */
const setupComp = (name: string): string => {
  const response = `Setting up new comp with name **${name}**`

  vercelSetup(name);

  return response;
}

/**
 * Add a new skill to the competition
 * @param name - Skill name
 * @param womId - WOM Competition ID
 * @param pointsMultiplier - Points multiplier
 * @returns - Discord command response
 */
const addSkill = (name: string, womId: string, pointsMultiplier: number): string => {
  let response = `Adding skill **${name} (${womId})**`

  if (pointsMultiplier !== undefined) {
    response += ` with a multiplier of **${pointsMultiplier}**`
  }

  vercelAdd(name, womId, pointsMultiplier)

  return response;
}

/**
 * Update a Discord initial response we previously sent
 * @param updatedMessage - Message we want to change to
 * @param token  - Discord message Interaction token used to update the previous message
 * @returns - Promise of Response
 */
const updateMessage = async (updatedMessage: string, token: string): Promise<Response> => {
  const appId = process.env.DISCORD_APP_ID
  const endpoint = `webhooks/${appId}/${token}/messages/@original`
  const body: DiscordWebhookUpdateBody = {
    content: updatedMessage
  }

  const headers: HeadersInit = {
    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    'Content-Type': 'application/json; charset=UTF-8'
  }

  return fetch(`https://discord.com/api/v10/${endpoint}`, {
    body: JSON.stringify(body),
    headers,
    method: 'PATCH'
  })
}

/**
 * Makes a request to the PUT /api/discord endpoint which kicks off the re-deployment process
 * @param token - Discord message Interaction token used to update the previous message
 */
const performAsyncDeploy = async (token: string) => {
  const body: AsyncWebhookData = {
    token
  }

  const hmac = generateHMAC(token)

  fetch(`${process.env.HOSTNAME}/api/discord`, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Token-Hmac': hmac
    },
    method: 'PUT',
    body: JSON.stringify(body)
  })
}

/**
 * Synchronous method to call Vercel API to re-run last deployment with new environment variables
 * @returns - Success or failure message
 */
const deployValues = async () => {
  const result = await vercelDeploy() ? 'Success :tada:' : 'Failure :crying_cat_face:';

  return `Deploying comp settings :rocket: ... ${result}`
}

/**
 * Verify and handle incoming webhooks from Discord
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
  // The initial interaction request from Discord
  const body = await req.json()
  const { type, data, token }: DiscordWebhookData = body;

  // Verify the request
  if (verify(JSON.stringify(body)) == false) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 401 })
  }

  if (type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG }, { status: 200 });
  }

  // Commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    let response: string;

    switch (name) {
      case 'setup':
        response = setupComp(options[0].value as string)
        break;
      case 'add':
        const skillName = options.find(option => option.name === 'name')!.value as string
        const womId = options.find(option => option.name === 'wom_id')!.value as string
        const pointsMultiplier = options.find(option => option.name === 'points_multiplier')!.value as number

        response = addSkill(skillName, womId, pointsMultiplier)
        break;
      case 'deploy':
        await performAsyncDeploy(token);

        return NextResponse.json({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
        }, { status: 200 });
    }

    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: response
      }
    }, { status: 200 });
  }
}

/**
 * Verify and handle asynchronous deployment request from `deploy` Discord command
 * @param req 
 * @returns 
 */
export async function PUT(req: NextRequest) {
  const { token }: AsyncWebhookData = await req.json();
  const hmac = headers().get('X-Token-Hmac')

  if (generateHMAC(token) !== hmac) {
    return NextResponse.json({
      success: false
    }, { status: 400 });
  }

  const message = await deployValues();

  await updateMessage(message, token)

  return NextResponse.json({
    success: true
  }, { status: 200 });
}
