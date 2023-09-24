import {
  InteractionType,
  InteractionResponseType
} from 'discord-interactions';

import { NextRequest, NextResponse } from 'next/server';
import { AsyncWebhookData, DiscordWebhookData, DiscordWebhookUpdateBody } from '@/lib/types';
import { 
  addSkill, 
  deployValues, 
  generateHMAC, 
  performAsyncDeploy, 
  setupComp, 
  updateMessage, 
  verify } from '@/lib/discord';

/**
 * Verify and handle incoming webhooks from Discord
 */
export async function POST(req: NextRequest) {
  // The initial interaction request from Discord
  const body = await req.json()
  const { type, data, token }: DiscordWebhookData = body;

  // Verify the request
  if (verify(JSON.stringify(body), req.headers) == false) {
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
        const pointsMultiplier = options.find(option => option.name === 'points_multiplier')?.value as number

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
  const hmac = req.headers.get('X-Token-Hmac')

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
