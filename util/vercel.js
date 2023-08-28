const projectName = 'socialbtw'
const token = process.env.VERCEL_TOKEN

const vercelApi = (url, method, body) => {
  const headers = {
    "Authorization": `Bearer ${token}`
  }

  const options = {
    method,
    headers
  }

  if(body !== undefined) {
    options.body = body;
  }

  return fetch(url, options)
}

const getEnvVarID = async(key) => {
  const url = `https://api.vercel.com/v9/projects/${projectName}/env`

  return vercelApi(url, 'get')
  .then(res => res.json()).then(body => {
    return body.envs.find(env => {
      return env.key === key
    })?.id
  })
}

const setEnvVar = async (key, value) => {
  const requestUrl = `https://api.vercel.com/v10/projects/${projectName}/env?upsert=true`
  const body = JSON.stringify({
    key,
    value,
    target: ['development', 'preview', 'production'],
    type: "encrypted"
  })

  return vercelApi(requestUrl, 'post', body);
}

const getEnvVar = async (name) => {
  const envVarId = await getEnvVarID(name)
  const requestUrl = `https://api.vercel.com/v1/projects/${projectName}/env/${envVarId}`

  return vercelApi(requestUrl, 'get')
  .then(res => res.json()).then(body => body.value)
}

const updateSkillList = async (name) => {
  const currentSkills = await getEnvVar('COMPETITION_SKILLS');

  setEnvVar('COMPETITION_SKILLS', `${currentSkills},${name.toLowerCase()}`)
}

const lastDeploymentId = async () => {
  const requestUrl = `https://api.vercel.com/v6/deployments?limit=1`

  return vercelApi(requestUrl, 'get')
  .then(res => res.json()).then(body => body.deployments[0].uid)
}

export const setup = async (name) => {
  setEnvVar('COMPETITION_NAME', name)
  setEnvVar('COMPETITION_SKILLS', '')
}

export const add = async (name, id, multiplier) => {
  let value = id;
  if(multiplier !== undefined) {
    value += `,${multiplier.toString()}`
  }

  setEnvVar(name.toUpperCase(), value.toString())
  updateSkillList(name)
}

export const deploy = async () => {
  const deploymentId = await lastDeploymentId();
  const requestUrl = `https://api.vercel.com/v13/deployments`
  const body = JSON.stringify({
    name: 'Discord-Redeployment', 
    deploymentId: deploymentId,
    target: 'production'
  })

  return await vercelApi(requestUrl, 'post', body).then(res => {
    console.log(res.status)

    return res.status == 200
  })
}
