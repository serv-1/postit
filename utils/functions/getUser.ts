import { notFound } from 'next/navigation'
import type { User } from 'types/common'
import env from 'utils/constants/env'

export default async function getUser(userId: string): Promise<User> {
  const res = await fetch(env.VERCEL_URL + '/api/users/' + userId, {
    cache: 'no-store',
  })

  if (!res.ok) {
    notFound()
  }

  return res.json()
}
