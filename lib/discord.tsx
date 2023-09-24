import { createHmac } from 'crypto';

import {
  verifyKey
} from 'discord-interactions';

import {
  setupComp as vercelSetup,
  addComp as vercelAdd,
  deployComp as vercelDeploy
} from '@/lib/vercel'

import { AsyncWebhookData, DiscordWebhookUpdateBody } from '@/lib/types';

/**
 * Generate an HMAC to sign requests to ensure authenticity
 * @param body 
 * @returns 
 */
export const generateHMAC = (body: string): string => {
  if (process.env.SECRET === undefined) {
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
export const verify = (body: string, headers: Headers): boolean => {
  const publicKey = process.env.DISCORD_APP_PUBLIC_KEY!

  const signature = headers.get('x-signature-ed25519');
  const timestamp = headers.get('x-signature-timestamp');

  if (!signature || !timestamp) {
    return false;
  }

  return verifyKey(body, signature, timestamp, publicKey)
}

/**
 * Setup a new competition
 * @param name - Competition name
 * @returns - Discord command response
 */
export const setupComp = (name: string): string => {
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
export const addSkill = (name: string, womId: string, pointsMultiplier: number): string => {
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
export const updateMessage = async (updatedMessage: string, token: string): Promise<Response> => {
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
export const performAsyncDeploy = async (token: string) => {
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
export const deployValues = async () => {
  const result = await vercelDeploy() ? 'Success :tada:' : 'Failure :crying_cat_face:';

  return `Deploying comp settings :rocket: ... ${result}`
}
