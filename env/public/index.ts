let name: string | null = null

switch (undefined) {
  case process.env.NEXT_PUBLIC_VERCEL_URL:
    name = 'NEXT_PUBLIC_VERCEL_URL'
    break
  case process.env.NEXT_PUBLIC_PUSHER_KEY:
    name = 'NEXT_PUBLIC_PUSHER_KEY'
    break
  case process.env.NEXT_PUBLIC_PUSHER_CLUSTER:
    name = 'NEXT_PUBLIC_PUSHER_CLUSTER'
    break
  case process.env.NEXT_PUBLIC_CSRF_HEADER_NAME:
    name = 'NEXT_PUBLIC_CSRF_HEADER_NAME'
    break
  case process.env.NEXT_PUBLIC_AWS_URL:
    name = 'NEXT_PUBLIC_AWS_URL'
    break
  case process.env.NEXT_PUBLIC_DEFAULT_USER_IMAGE:
    name = 'NEXT_PUBLIC_DEFAULT_USER_IMAGE'
    break
  case process.env.NEXT_PUBLIC_LOCATION_IQ_TOKEN:
    name = 'NEXT_PUBLIC_LOCATION_IQ_TOKEN'
    break
}

if (name) {
  throw new Error('env: "' + name + '" is undefined')
}

export const NEXT_PUBLIC_VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL!
export const NEXT_PUBLIC_PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY!
export const NEXT_PUBLIC_PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
export const NEXT_PUBLIC_CSRF_HEADER_NAME = process.env.NEXT_PUBLIC_CSRF_HEADER_NAME!
export const NEXT_PUBLIC_AWS_URL = process.env.NEXT_PUBLIC_AWS_URL!
export const NEXT_PUBLIC_DEFAULT_USER_IMAGE = process.env.NEXT_PUBLIC_DEFAULT_USER_IMAGE!
export const NEXT_PUBLIC_LOCATION_IQ_TOKEN = process.env.NEXT_PUBLIC_LOCATION_IQ_TOKEN!
