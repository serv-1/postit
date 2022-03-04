import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useToast } from '../contexts/toast'
import { Post } from '../types/common'
import getAxiosError from '../utils/functions/getAxiosError'
import PostsFoundNumber from './PostsFoundNumber'
import PostList from './PostList'
import Pagination from './Pagination'

interface Response {
  posts: Post[]
  totalPages: number
  totalPosts: number
}

const HomePostPage = () => {
  const [posts, setPosts] = useState<Post[]>()
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
        setToast({ message, background: 'danger' })
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

  return (
    <>
      <PostsFoundNumber nb={totalPosts} />
      <PostList posts={posts} />
      <Pagination totalPages={totalPages} />
    </>
  )
}

export default HomePostPage
