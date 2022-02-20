import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useToast } from '../contexts/toast'
import { Post } from '../types/common'
import getAxiosError from '../utils/functions/getAxiosError'
import HomePostsTotalNumber from './HomePostsTotalNumber'
import HomePostsPage from './HomePostsPage'
import Pagination from './Pagination'

interface Response {
  posts: Post[]
  totalPages: number
  totalPosts: number
}

const HomePosts = () => {
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
      <div className="row justify-content-center position-relative">
        <div className="col-md-8">
          <HomePostsTotalNumber totalPosts={totalPosts} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
      <div className="row py-4 justify-content-center">
        <HomePostsPage posts={posts} />
      </div>
      <div className="row">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  )
}

export default HomePosts
