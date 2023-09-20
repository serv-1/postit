import { notFound } from 'next/navigation'
import type { User } from 'types'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'

export default async function getUser(userId: string): Promise<User> {
  const res = await fetch(NEXT_PUBLIC_VERCEL_URL + '/api/users/' + userId, {
    cache: 'no-store',
  })

  if (!res.ok) {
    notFound()
  }

  return res.json()
}
