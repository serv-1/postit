import type { UserFavoritePost } from 'types'
import getPost from 'functions/getPost'

export default async function getUserFavoritePosts(
  postIds: string[]
): Promise<UserFavoritePost[]> {
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
