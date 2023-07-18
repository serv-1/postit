import { notFound } from 'next/navigation'
import env from 'utils/constants/env'
import type { Post } from 'types/common'

export default async function getPost(postID: string): Promise<Post> {
  const res = await fetch(env.VERCEL_URL + '/api/posts/' + postID, {
    cache: 'no-store',
  })

  if (!res.ok) {
    notFound()
  }

  return res.json()
}
