import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'
import type { UsersIdGetData, UsersIdGetError } from 'app/api/users/[id]/types'

export default async function getUser(userId: string): Promise<UsersIdGetData> {
  const response = await fetch(
    NEXT_PUBLIC_VERCEL_URL + '/api/users/' + userId,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    const { message }: UsersIdGetError = await response.json()

    throw new Error(message)
  }

  return response.json()
}
