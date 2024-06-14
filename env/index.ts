let name: string | null = null

switch (undefined) {
  case process.env.GOOGLE_ID:
    name = 'GOOGLE_ID'
    break
  case process.env.GOOGLE_SECRET:
    name = 'GOOGLE_SECRET'
    break
  case process.env.SECRET:
    name = 'SECRET'
    break
  case process.env.MONGO_URI:
    name = 'MONGO_URI'
    break
  case process.env.EMAIL_HOST:
    name = 'EMAIL_HOST'
    break
  case process.env.EMAIL_PORT:
    name = 'EMAIL_PORT'
    break
  case process.env.EMAIL_FROM:
    name = 'EMAIL_FROM'
    break
  case process.env.EMAIL_USER:
    name = 'EMAIL_USER'
    break
  case process.env.EMAIL_PASS:
    name = 'EMAIL_PASS'
    break
  case process.env.NEXTAUTH_URL:
    name = 'NEXTAUTH_URL'
    break
  case process.env.PUSHER_ENCRYPTION_KEY:
    name = 'PUSHER_ENCRYPTION_KEY'
    break
  case process.env.PUSHER_SECRET:
    name = 'PUSHER_SECRET'
    break
  case process.env.PUSHER_APP_ID:
    name = 'PUSHER_APP_ID'
    break
  case process.env.CSRF_COOKIE_NAME:
    name = 'CSRF_COOKIE_NAME'
    break
  case process.env.AWS_ACCESS_KEY_ID_:
    name = 'AWS_ACCESS_KEY_ID_'
    break
  case process.env.AWS_SECRET_ACCESS_KEY_:
    name = 'AWS_SECRET_ACCESS_KEY_'
    break
  case process.env.AWS_REGION_:
    name = 'AWS_REGION_'
    break
  case process.env.AWS_BUCKET_NAME:
    name = 'AWS_BUCKET_NAME'
    break
}

if (name) {
  throw new Error('env: "' + name + '" is undefined')
}

export const GOOGLE_ID = process.env.GOOGLE_ID!
export const GOOGLE_SECRET = process.env.GOOGLE_SECRET!
export const SECRET = process.env.SECRET!
export const MONGO_URI = process.env.MONGO_URI!
export const EMAIL_HOST = process.env.EMAIL_HOST!
export const EMAIL_PORT = process.env.EMAIL_PORT!
export const EMAIL_FROM = process.env.EMAIL_FROM!
export const EMAIL_USER = process.env.EMAIL_USER!
export const EMAIL_PASS = process.env.EMAIL_PASS!
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL!
export const PUSHER_ENCRYPTION_KEY = process.env.PUSHER_ENCRYPTION_KEY!
export const PUSHER_SECRET = process.env.PUSHER_SECRET!
export const PUSHER_APP_ID = process.env.PUSHER_APP_ID!
export const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME!
export const AWS_ACCESS_KEY_ID_ = process.env.AWS_ACCESS_KEY_ID_!
export const AWS_SECRET_ACCESS_KEY_ = process.env.AWS_SECRET_ACCESS_KEY_!
export const AWS_REGION_ = process.env.AWS_REGION_!
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME!
