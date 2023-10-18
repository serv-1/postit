import type { Post } from 'types'
import getPost from 'functions/getPost'

export default async function getPosts(
  postIds: string[]
): Promise<Post[] | undefined> {
  const posts = await Promise.all(postIds.map(getPost))

  if (!posts.includes(undefined)) {
    return posts as Post[]
  }
}
