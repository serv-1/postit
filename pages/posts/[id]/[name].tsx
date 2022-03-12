import axios from 'axios'
import { GetServerSideProps } from 'next'
import { IPost } from '../../../types/common'
import PostImages from '../../../components/PostImages'
import addCommasToNb from '../../../utils/functions/addCommasToNb'
import Head from 'next/head'

interface Post extends Omit<IPost, 'userId'> {
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
    <>
      <Head>
        <title>{post.name} - Filanad</title>
      </Head>
      <main className="py-32 grid grid-cols-4 md:grid-cols-[repeat(6,72px)] gap-x-16 justify-center">
        <h1 className="col-span-full text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16">
          {post.name}
        </h1>
        <div className="col-span-full mb-8">
          categorized in{' '}
          {post.categories.map((category) => (
            <span
              key={category}
              className="border border-black rounded px-8 py-4 mr-4"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="col-span-full mb-8">
          for{' '}
          <span className="text-indigo-600 text-4xl md:text-t-4xl lg:text-d-4xl font-bold ">
            {addCommasToNb(post.price)}€
          </span>
        </div>
        <PostImages images={post.images} />
        <div className="col-span-full bg-indigo-200 rounded p-8 mt-8 relative">
          <span className="italic text-s absolute top-0 start-8 -translate-y-1/2">
            <span className="font-bold">{post.username}</span> says
          </span>
          <p>{post.description}</p>
        </div>
      </main>
    </>
  )
}

export default Post
