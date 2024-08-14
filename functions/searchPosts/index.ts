import type {
  PostsSearchGetData,
  PostsSearchGetError,
} from 'app/api/posts/search/types'
import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'

export default async function searchPosts(
  searchParams: string
): Promise<PostsSearchGetData> {
  const response = await fetch(
    NEXT_PUBLIC_VERCEL_URL + '/api/posts/search?' + searchParams,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    const { message }: PostsSearchGetError = await response.json()

    throw new Error(message)
  }

  return response.json()
}
