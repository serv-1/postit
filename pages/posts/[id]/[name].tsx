import axios from 'axios'
import { GetServerSideProps } from 'next'
import { IPost } from '../../../types/common'
import PostImages from '../../../components/PostImages'
import addSpacesToNb from '../../../utils/functions/addSpacesToNb'
import Head from 'next/head'
import Link from '../../../components/Link'
import PostList from '../../../components/PostList'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id

  try {
    const res = await axios.get<IPost>(`http://localhost:3000/api/posts/${id}`)
    return { props: { post: res.data } }
  } catch (e) {
    return { notFound: true }
  }
}

interface PostProps {
  post: IPost
}

const Post = ({ post }: PostProps) => {
  return (
    <>
      <Head>
        <title>{post.name} - Filanad</title>
      </Head>
      <main className="py-32 grid grid-cols-4 md:grid-cols-[repeat(6,72px)] gap-x-16 justify-center">
        <section className="col-span-full mb-32">
          <h1 className="text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16">
            {post.name}
          </h1>
          <div className="mb-8">
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
          <div className="mb-8">
            for{' '}
            <span className="text-indigo-600 text-4xl md:text-t-4xl lg:text-d-4xl font-bold ">
              {addSpacesToNb(post.price)}€
            </span>
          </div>
          <PostImages images={post.images} />
          <div className="bg-indigo-200 rounded p-8 mt-8 relative">
            <span className="italic text-s absolute top-0 start-8 -translate-y-1/2">
              <Link
                href={`/users/${post.user.id}`}
                className="font-bold hover:underline"
                title={`${post.user.name}'s profile`}
              >
                {post.user.name}
              </Link>{' '}
              says
            </span>
            <p>{post.description}</p>
          </div>
        </section>
        {post.user.posts.length > 0 && (
          <section className="col-span-full">
            <h2 className="text-3xl md:text-t-3xl lg:text-d-3xl font-bold mb-16">
              {post.user.name}&apos;s other posts
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-[repeat(6,72px)] gap-x-16 justify-center">
              <PostList posts={post.user.posts} />
            </div>
          </section>
        )}
      </main>
    </>
  )
}

export default Post
