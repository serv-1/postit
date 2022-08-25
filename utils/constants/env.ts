const getEnvVar = (name: string): string => {
  const envVar = process.env[name]
  if (!envVar) throw new Error(`Environment variable "${name}" is undefined.`)
  return envVar
}

const env = {
  GOOGLE_ID: getEnvVar('GOOGLE_ID'),
  GOOGLE_SECRET: getEnvVar('GOOGLE_SECRET'),
  SECRET: getEnvVar('SECRET'),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  EMAIL_HOST: getEnvVar('EMAIL_HOST'),
  EMAIL_PORT: getEnvVar('EMAIL_PORT'),
  EMAIL_USER: getEnvVar('EMAIL_USER'),
  EMAIL_PASS: getEnvVar('EMAIL_PASS'),
  EMAIL_FROM: getEnvVar('EMAIL_FROM'),
  BASE_URL: getEnvVar('BASE_URL'),
  NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL'),
  PUSHER_ENCRYPTION_KEY: getEnvVar('PUSHER_ENCRYPTION_KEY'),
  PUSHER_KEY: getEnvVar('PUSHER_KEY'),
  PUSHER_CLUSTER: getEnvVar('PUSHER_CLUSTER'),
  PUSHER_SECRET: getEnvVar('PUSHER_SECRET'),
  PUSHER_APP_ID: getEnvVar('PUSHER_APP_ID'),
}

export default env
