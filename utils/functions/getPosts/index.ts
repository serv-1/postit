import type { Post } from 'types/common'
import getPost from 'utils/functions/getPost'

export default async function getPosts(postIds: string[]): Promise<Post[]> {
  return Promise.all(postIds.map(getPost))
}
