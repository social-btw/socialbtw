import { VercelApiBody, VercelDeployCompBody, VercelEnvVar, VercelSetEnvVarBody } from "./types"

const projectName = 'socialbtw'
const token = process.env.VERCEL_TOKEN

/**
 * Make a request to the Vercel API
 * @param url - URL to request
 * @param method - HTTP method
 * @param body - HTTP request body
 * @returns - Promise of Response
 */
const vercelApi = (url: string, method: 'get' | 'post', body?: VercelApiBody): Promise<Response> => {
  const headers: HeadersInit = {
    "Authorization": `Bearer ${token}`
  }

  const options: RequestInit = {
    method,
    headers
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options)
}

/**
 * Fetch the ID of a Vercel project environment variable
 * @param key - Key of the env var to fetch
 * @returns - Promise of env var ID
 */
const getEnvVarID = async (key: string): Promise<string> => {
  const url = `https://api.vercel.com/v9/projects/${projectName}/env`

  return vercelApi(url, 'get')
    .then(res => res.json()).then(body => {
      return body.envs.find((env: VercelEnvVar) => {
        return env.key === key
      })?.id
    })
}

/**
 * Set an environment variable on a Vercel project
 * @param key - Key of the env var to set
 * @param value - Value to set env var to
 * @returns - The Promise of the API response
 */
const setEnvVar = async (key: string, value: string): Promise<Response> => {
  const requestUrl = `https://api.vercel.com/v10/projects/${projectName}/env?upsert=true`
  const body: VercelSetEnvVarBody = {
    key,
    value,
    target: ['development', 'preview', 'production'],
    type: "encrypted"
  }

  return vercelApi(requestUrl, 'post', body);
}

/**
 * Get an environment variable on a Vercel project
 * @param name - Key of the env var to get
 * @returns  - The Promise of the env var value
 */
const getEnvVar = async (name: string) => {
  const envVarId = await getEnvVarID(name)
  const requestUrl = `https://api.vercel.com/v1/projects/${projectName}/env/${envVarId}`

  return vercelApi(requestUrl, 'get')
    .then(res => res.json()).then(body => body.value)
}

/**
 * Appends the Competitions skills env var with a new skill
 * @param name - Name of skill to add to skill list
 */
const updateSkillList = async (name: string) => {
  const compSkillsList: string[] = (await getEnvVar('NEXT_PUBLIC_COMPETITION_SKILLS')).split(',');

  compSkillsList.push(name.toLowerCase())

  setEnvVar('NEXT_PUBLIC_COMPETITION_SKILLS', compSkillsList.filter(i => i).join())
}

/**
 * Fetch the ID of the most recent deploymennt
 * @returns - Promise of the deployment ID
 */
const lastDeploymentId = async () => {
  const requestUrl = `https://api.vercel.com/v6/deployments?limit=1`

  return vercelApi(requestUrl, 'get')
    .then(res => res.json()).then(body => body.deployments[0].uid)
}
/**
 * Clear the old the competition and set up a new one
 * @param name - Name of the new competition
 */
export const setupComp = async (name: string) => {
  setEnvVar('NEXT_PUBLIC_COMPETITION_NAME', name)
  setEnvVar('NEXT_PUBLIC_COMPETITION_SKILLS', '')
}

/**
 * Adds a skill to the new Competition
 * @param name - Skill name
 * @param id - WOM competition ID
 * @param multiplier - Optional multiplier for the skill
 */
export const addComp = async (name: string, id: string, multiplier: number) => {
  let value = id;
  if (multiplier !== undefined) {
    value += `,${multiplier.toString()}`
  }

  setEnvVar(`NEXT_PUBLIC_${name.toUpperCase()}`, value.toString())
  updateSkillList(name)
}

/**
 * Re-deploys the site with new Competition settings
 * @returns 
 */
export const deployComp = async () => {
  const deploymentId = await lastDeploymentId();
  const requestUrl = `https://api.vercel.com/v13/deployments`
  const body: VercelDeployCompBody = {
    name: 'Discord-Redeployment',
    deploymentId: deploymentId,
    target: 'production'
  }

  return await vercelApi(requestUrl, 'post', body).then(res => res.status == 200)
}
