import type { Post } from 'types'
import getPost from 'functions/getPost'

export default async function getPosts(postIds: string[]): Promise<Post[]> {
  return Promise.all(postIds.map(getPost))
}
