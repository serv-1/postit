import type { UserPost } from 'types'
import getPost from 'utils/functions/getPost'

export default async function getUserPosts(
  postIds: string[]
): Promise<UserPost[]> {
  const userPosts = postIds.map(async (postId) => {
    const post = await getPost(postId)

    return {
      id: post.id,
      name: post.name,
      price: post.price,
      address: post.address,
      image: post.images[0],
    }
  })

  return Promise.all(userPosts)
}
