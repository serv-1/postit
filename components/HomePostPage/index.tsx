'use client'

import { useEffect, useState } from 'react'
import { useToast } from 'contexts/toast'
import type { SearchedPost } from 'types'
import PostList from 'components/PostList'
import Pagination from 'components/Pagination'
import Blob from 'public/static/images/blob.svg'
import ajax from 'libs/ajax'
import type {
  PostsSearchGetData,
  PostsSearchGetError,
} from 'app/api/posts/search/types'

export default function HomePostPage() {
  const [posts, setPosts] = useState<SearchedPost[]>()
  const [totalPosts, setTotalPosts] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)

  const { setToast } = useToast()

  useEffect(() => {
    const onQueryStringChange = async () => {
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
    }

    document.addEventListener('queryStringChange', onQueryStringChange)

    if (window.location.search) {
      document.dispatchEvent(new CustomEvent('queryStringChange'))
    }

    return () => {
      document.removeEventListener('queryStringChange', onQueryStringChange)
    }
  }, [setToast])

  return posts && posts.length > 0 ? (
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
        {!posts ? 'Search something' : 'No posts found'}
      </span>
    </div>
  )
}
