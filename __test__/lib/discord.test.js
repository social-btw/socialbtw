import { createHmac } from 'crypto';

import {
  generateHMAC,
  verify,
  addSkill,
  setupComp,
  updateMessage,
  performAsyncDeploy,
  deployValues
} from '@/lib/discord'

jest.mock('../../lib/vercel', () => ({
  addComp: jest.fn().mockReturnValue(true),
  setupComp: jest.fn().mockReturnValue(true),
  deployComp: jest.fn().mockReturnValue(true)
}))

import {
  setupComp as vercelSetup,
  addComp as vercelAdd,
  deployComp as vercelDeploy
} from '../../lib/vercel'

describe("Discord utility functions", () => {
  beforeAll(() => {
    global.TextEncoder = require('text-encoding').TextEncoder;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(true)
      })
    );
  });

  describe("generateHMAC", () => {
    it('should generate the correct HMAC', () => {
      process.env.SECRET = 'mySecret';

      const testMessage = 'Hello, world!';

      const expectedHMAC = createHmac('sha256', 'mySecret')
        .update(testMessage)
        .digest('hex');
      const actualHMAC = generateHMAC(testMessage);

      expect(actualHMAC).toEqual(expectedHMAC);
    });

    it('should throw an error if SECRET is undefined', () => {
      delete process.env.SECRET;

      const testMessage = 'Hello, world!';

      expect(() => generateHMAC(testMessage)).toThrow('Secret cannot be undefined');
    });
  })

  describe("verify", () => {
    let mockHeaders;

    beforeEach(() => {
      mockHeaders = new Headers();
    });

    it('should return false if signature or timestamp are missing', () => {
      mockHeaders.set('x-signature-ed25519', 'some-signature');

      const result = verify('some-body', mockHeaders);

      expect(result).toBeFalsy();
    });
  })

  describe("setupComp", () => {
    it('should setup a new competition with a given name', () => {
      const name = 'Utility';
      const result = setupComp(name);

      expect(result).toBe(`Setting up new comp with name **${name}**`);
      expect(vercelSetup).toHaveBeenCalledWith(name);
    });
  })

  describe("addSkill", () => {
    it('should add a skill without a points multiplier', () => {
      const name = 'SkillName';
      const womId = '11111';
      const result = addSkill(name, womId, undefined);

      expect(result).toBe(`Adding skill **${name} (${womId})**`);
      expect(vercelAdd).toHaveBeenCalledWith(name, womId, undefined);
    });

    it('should add a skill with a points multiplier', () => {
      const name = 'SkillName';
      const womId = '22222';
      const pointsMultiplier = 2;
      const result = addSkill(name, womId, pointsMultiplier);

      expect(result).toBe(`Adding skill **${name} (${womId})** with a multiplier of **${pointsMultiplier}**`);
      expect(vercelAdd).toHaveBeenCalledWith(name, womId, pointsMultiplier);
    });
  })

  describe("updateMessage", () => {
    it('should make an API call to update the Discord message', async () => {
      const appId = 'discord-app-id'
      const updatedMessage = 'New message content';
      const token = 'someToken';
      const expectedUrl = `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`;

      process.env.DISCORD_APP_ID = appId
      await updateMessage(updatedMessage, token);

      expect(fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json; charset=UTF-8'
          }),
          body: JSON.stringify({ content: updatedMessage })
        })
      );
    });
  })

  describe("performAsyncDeploy", () => {
    it('should make an API call to kick off a deployment', async () => {
      process.env.SECRET = 'asdfasdfsdfa'

      const token = 'someToken';
      const hmac = generateHMAC(token)
      const hostname = 'https://www.socialbtw.com'

      process.env.HOSTNAME = hostname
      const expectedUrl = `${hostname}/api/discord`;

      await performAsyncDeploy(token);

      expect(fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Token-Hmac': hmac
          }),
          body: JSON.stringify({ token })
        })
      );
    });
  })

  describe("deployValues", () => {
    it('should push Vercel API to kick off a new deployment with new environment variables', async () => {
      const result = await deployValues();

      expect(result).toBe('Deploying comp settings :rocket: ... Success :tada:');
      expect(vercelDeploy).toHaveBeenCalled();
    });

    it('returns failure message if deployment returns unsuccessfully', async () => {
      vercelDeploy.mockResolvedValue(false)

      const result = await deployValues();

      expect(result).toBe('Deploying comp settings :rocket: ... Failure :crying_cat_face:');
    });
  })
})
