import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'
import type { PostsIdGetData, PostsIdGetError } from 'app/api/posts/[id]/types'

export default async function getPost(postId: string): Promise<PostsIdGetData> {
  const response = await fetch(
    NEXT_PUBLIC_VERCEL_URL + '/api/posts/' + postId,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    const { message }: PostsIdGetError = await response.json()

    throw new Error(message)
  }

  return response.json()
}
