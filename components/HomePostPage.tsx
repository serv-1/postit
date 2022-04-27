import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useToast } from '../contexts/toast'
import { ILightPost } from '../types/common'
import getAxiosError from '../utils/functions/getAxiosError'
import PostList from './PostList'
import Pagination from './Pagination'
import Blob from '../public/static/images/blob.svg'

interface Response {
  posts: ILightPost[]
  totalPages: number
  totalPosts: number
}

const HomePostPage = () => {
  const [posts, setPosts] = useState<ILightPost[]>()
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

  return posts && posts.length > 0 ? (
    <div className="col-span-full lg:col-start-5 lg:row-span-full mb-32">
      <div className="mb-16" role="status">
        {totalPosts} posts found
      </div>
      <PostList posts={posts} />
      <Pagination totalPages={totalPages} />
    </div>
  ) : (
    <div
      className="col-span-full lg:col-start-5 lg:row-span-full relative"
      role="status"
    >
      <Blob className="w-full h-3/4 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
      <span className="text-m-4xl md:text-t-4xl w-full text-center absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        {!posts ? 'Search something' : 'No posts found'}
      </span>
    </div>
  )
}

export default HomePostPage
