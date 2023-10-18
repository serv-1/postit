import type { UserPost } from 'types'
import getPost from 'functions/getPost'

export default async function getUserPosts(
  postIds: string[]
): Promise<UserPost[] | undefined> {
  const userPosts = await Promise.all(
    postIds.map(async (postId) => {
      const post = await getPost(postId)

      if (post) {
        return {
          id: post.id,
          name: post.name,
          price: post.price,
          address: post.address,
          image: post.images[0],
        }
      }
    })
  )

  if (!userPosts.includes(undefined)) {
    return userPosts as UserPost[]
  }
}
