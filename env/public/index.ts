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

export const NEXT_PUBLIC_VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL as string
export const NEXT_PUBLIC_PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY as string
export const NEXT_PUBLIC_PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string
export const NEXT_PUBLIC_CSRF_HEADER_NAME = process.env.NEXT_PUBLIC_CSRF_HEADER_NAME as string
export const NEXT_PUBLIC_AWS_URL = process.env.NEXT_PUBLIC_AWS_URL as string
export const NEXT_PUBLIC_DEFAULT_USER_IMAGE = process.env.NEXT_PUBLIC_DEFAULT_USER_IMAGE as string
export const NEXT_PUBLIC_LOCATION_IQ_TOKEN = process.env.NEXT_PUBLIC_LOCATION_IQ_TOKEN as string
