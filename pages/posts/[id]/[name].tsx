import axios from 'axios'
import { GetServerSideProps } from 'next'
import { IPost } from '../../../models/Post'
import PostImages from '../../../components/PostImages'
import PostInfos from '../../../components/PostInfos'

interface Post extends Omit<IPost, '_id' | 'userId'> {
  id: string
  username: string
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id

  try {
    const postsRes = await axios.get(`http://localhost:3000/api/posts/${id}`)
    const post = postsRes.data

    const usersRes = await axios.get(
      `http://localhost:3000/api/users/${post.userId}`
    )
    const user = usersRes.data

    delete post.userId

    return {
      props: {
        post: {
          ...post,
          username: user.name,
        },
      },
    }
  } catch (e) {
    return { notFound: true }
  }
}

interface PostProps {
  post: Post
}

const Post = ({ post }: PostProps) => {
  return (
    <main className="container-fluid my-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="row">
            <PostImages images={post.images} />
            <PostInfos
              name={post.name}
              description={post.description}
              price={post.price}
              username={post.username}
              categories={post.categories}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default Post
