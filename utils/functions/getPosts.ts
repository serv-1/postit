import type { Post } from 'types/common'
import getPost from './getPost'

export default async function getPosts(postIDs: string[]): Promise<Post[]> {
  const posts = postIDs.map(getPost)

  return await Promise.all(posts)
}
