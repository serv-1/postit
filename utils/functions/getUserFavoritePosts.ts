import { notFound } from 'next/navigation'
import type { LightPost, Post } from 'types/common'
import env from 'utils/constants/env'

export default async function getUserFavoritePosts(
  postIDs: string[]
): Promise<Omit<LightPost, 'price' | 'address'>[]> {
  const favoritePosts = postIDs.map(async (postID) => {
    const res = await fetch(env.VERCEL_URL + '/api/posts/' + postID, {
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
