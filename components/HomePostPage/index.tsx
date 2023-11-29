'use client'

import { useEffect, useState } from 'react'
import useToast from 'hooks/useToast'
import type { SearchedPost } from 'types'
import PostList from 'components/PostList'
import Pagination from 'components/Pagination'
import Blob from 'public/static/images/blob.svg'
import ajax from 'libs/ajax'
import type {
  PostsSearchGetData,
  PostsSearchGetError,
} from 'app/api/posts/search/types'
import useEventListener from 'hooks/useEventListener'

export default function HomePostPage() {
  const [posts, setPosts] = useState<SearchedPost[]>()
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const { setToast } = useToast()

  useEventListener(document, 'searchPost', async () => {
    const response = await ajax.get('/posts/search' + window.location.search)

    if (!response.ok) {
      const { message }: PostsSearchGetError = await response.json()

      setToast({ message, error: true })

      return
    }

    const data: PostsSearchGetData = await response.json()

    setPosts(data.posts)
    setTotalPosts(data.totalPosts)
    setTotalPages(data.totalPages)
  })

  useEffect(() => {
    if (window.location.search) {
      document.dispatchEvent(new CustomEvent('searchPost'))
    }
  }, [])

  return posts?.length ? (
    <div>
      <div className="mb-16" role="status">
        {totalPosts} post{totalPosts !== 1 ? 's' : ''} found
      </div>
      <PostList posts={posts} />
      <Pagination totalPages={totalPages} />
    </div>
  ) : (
    <div className="grow self-stretch relative" role="status">
      <Blob className="w-full h-3/4 absolute top-1/2 -translate-y-1/2" />
      <span className="text-m-4xl md:text-t-4xl w-full text-center absolute top-1/2 -translate-y-1/2">
        {posts ? 'No posts found' : 'Search something'}
      </span>
    </div>
  )
}
