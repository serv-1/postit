const getEnvVar = (name: string) => {
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
  VERCEL_URL: getEnvVar('NEXT_PUBLIC_VERCEL_URL'),
  NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL'),
  PUSHER_KEY: getEnvVar('NEXT_PUBLIC_PUSHER_KEY'),
  PUSHER_CLUSTER: getEnvVar('NEXT_PUBLIC_PUSHER_CLUSTER'),
  PUSHER_ENCRYPTION_KEY: getEnvVar('PUSHER_ENCRYPTION_KEY'),
  PUSHER_SECRET: getEnvVar('PUSHER_SECRET'),
  PUSHER_APP_ID: getEnvVar('PUSHER_APP_ID'),
  CSRF_TOKEN_COOKIE_NAME: getEnvVar('CSRF_TOKEN_COOKIE_NAME'),
  AWS_ACCESS_KEY_ID_: getEnvVar('AWS_ACCESS_KEY_ID_'),
  AWS_SECRET_ACCESS_KEY_: getEnvVar('AWS_SECRET_ACCESS_KEY_'),
  AWS_REGION_: getEnvVar('AWS_REGION_'),
  AWS_BUCKET_NAME: getEnvVar('AWS_BUCKET_NAME'),
  AWS_URL: getEnvVar('NEXT_PUBLIC_AWS_URL'),
  DEFAULT_USER_IMAGE: getEnvVar('NEXT_PUBLIC_DEFAULT_USER_IMAGE'),
}

export default env
