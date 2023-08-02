import { notFound } from 'next/navigation'
import type { LightPost, Post } from 'types/common'
import env from 'utils/constants/env'

export default async function getUserFavoritePosts(
  postIds: string[]
): Promise<Omit<LightPost, 'price' | 'address'>[]> {
  const favoritePosts = postIds.map(async (postId) => {
    const res = await fetch(env.VERCEL_URL + '/api/posts/' + postId, {
      cache: 'no-store',
    })

    if (!res.ok) {
      notFound()
    }

    const { id, name, images }: Post = await res.json()
    return { id, name, image: images[0] }
  })

  return await Promise.all(favoritePosts)
}
