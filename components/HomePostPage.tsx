import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useToast } from '../contexts/toast'
import { ISearchedPost } from '../types/common'
import getAxiosError from '../utils/functions/getAxiosError'
import PostsFoundNumber from './PostsFoundNumber'
import PostList from './PostList'
import Pagination from './Pagination'
import classNames from 'classnames'

interface Response {
  posts: ISearchedPost[]
  totalPages: number
  totalPosts: number
}

const HomePostPage = () => {
  const [posts, setPosts] = useState<ISearchedPost[]>()
  const [totalPosts, setTotalPosts] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)

  const { setToast } = useToast()

  useEffect(() => {
    const onQueryStringChange = async () => {
      try {
        const { data } = await axios.get<Response>(
          `http://localhost:3000/api/posts/search${window.location.search}`
        )

        setPosts(data.posts)
        setTotalPosts(data.totalPosts)
        setTotalPages(data.totalPages)
      } catch (e) {
        const { message } = getAxiosError(e as AxiosError)
        setToast({ message, error: true })
      }
    }

    document.addEventListener('queryStringChange', onQueryStringChange)

    if (window.location.search) {
      document.dispatchEvent(new CustomEvent('queryStringChange'))
    }

    return () => {
      document.removeEventListener('queryStringChange', onQueryStringChange)
    }
  }, [setToast])

  const containerClass = classNames(
    'grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-16 justify-center',
    { 'my-auto': !posts || posts.length === 0 }
  )

  return (
    <div data-testid="container" className={containerClass}>
      {posts && posts.length > 0 ? (
        <>
          <PostsFoundNumber nb={totalPosts} />
          <div className={containerClass + ' col-span-full'}>
            <PostList posts={posts} />
          </div>
          <Pagination totalPages={totalPages} />
        </>
      ) : (
        <div
          className="col-span-full text-center text-4xl md:text-t-4xl lg:text-d-4xl"
          role="status"
        >
          {!posts ? 'Search something ☝' : 'No posts found 😮'}
        </div>
      )}
    </div>
  )
}

export default HomePostPage
