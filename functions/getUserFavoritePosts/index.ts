import type { UserFavoritePost } from 'types'
import getPost from 'functions/getPost'

export default async function getUserFavoritePosts(
  postIds: string[]
): Promise<UserFavoritePost[] | undefined> {
  const favoritePosts = await Promise.all(
    postIds.map(async (postId) => {
      const post = await getPost(postId)

      if (post) {
        return {
          id: post.id,
          name: post.name,
          image: post.images[0],
        }
      }
    })
  )

  if (!favoritePosts.includes(undefined)) {
    return favoritePosts as UserFavoritePost[]
  }
}
