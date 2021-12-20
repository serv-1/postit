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
export const MONGODB_URI = getEnvVar('MONGODB_URI')
export const EMAIL_HOST = getEnvVar('EMAIL_HOST')
export const EMAIL_PORT = getEnvVar('EMAIL_PORT')
export const EMAIL_USER = getEnvVar('EMAIL_USER')
export const EMAIL_PASS = getEnvVar('EMAIL_PASS')
export const EMAIL_FROM = getEnvVar('EMAIL_FROM')

const env = {
  GOOGLE_ID,
  GOOGLE_SECRET,
  SECRET,
  MONGODB_URI,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
}

export default env
