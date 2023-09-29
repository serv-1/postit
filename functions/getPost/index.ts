import { notFound } from 'next/navigation'
import type { Post } from 'types'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'

export default async function getPost(postId: string): Promise<Post> {
  const res = await fetch(NEXT_PUBLIC_VERCEL_URL + '/api/posts/' + postId, {
    cache: 'no-store',
  })

  if (!res.ok) {
    notFound()
  }

  return res.json()
}
