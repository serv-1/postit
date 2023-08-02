import type { Post } from 'types/common'
import getPost from './getPost'

export default async function getPosts(postIds: string[]): Promise<Post[]> {
  const posts = postIds.map(getPost)

  return await Promise.all(posts)
}
