import type { LightPost } from 'types/common'
import getPost from 'utils/functions/getPost'

export default async function getUserFavoritePosts(
  postIds: string[]
): Promise<Omit<LightPost, 'price' | 'address'>[]> {
  const favoritePosts = postIds.map(async (postId) => {
    const post = await getPost(postId)

    return {
      id: post.id,
      name: post.name,
      image: post.images[0],
    }
  })

  return Promise.all(favoritePosts)
}
