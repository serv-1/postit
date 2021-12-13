const getEnvVar = (name: string): string => {
  const envVar = process.env[name]
  if (!envVar) {
    throw new Error(`Environment variable "${name}" is undefined.`)
  }
  return envVar
}

export const GOOGLE_ID = getEnvVar('GOOGLE_ID')
export const GOOGLE_SECRET = getEnvVar('GOOGLE_SECRET')
export const SECRET = getEnvVar('SECRET')

const env = {
  GOOGLE_ID,
  GOOGLE_SECRET,
  SECRET,
}

export default env
