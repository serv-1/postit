import axios from 'axios'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../../../components/Header'
import PostList from '../../../components/PostList'
import { Post, User } from '../../../types/common'
import Blob from '../../../public/static/images/blob.svg'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userId = ctx.params?.id

  try {
    const url = 'http://localhost:3000/api/users/' + userId
    const { data: user } = await axios.get<User>(url)

    const posts: Post[] = []

    for (const postId of user.postsIds) {
      const url = 'http://localhost:3000/api/posts/' + postId
      posts.push((await axios.get<Post>(url)).data)
    }

    return { props: { user: { ...user, posts } } }
  } catch (e) {
    return { notFound: true }
  }
}

interface UserPageProps {
  user: Omit<User, 'postsIds'> & { posts: Post[] }
}

const UserPage = ({ user }: UserPageProps) => {
  return (
    <>
      <Head>
        <title>{user.name}&apos;s profile - Filanad</title>
      </Head>
      <Header />
      <main className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid-rows-[auto_1fr] gap-x-24">
        <section className="col-span-full mb-32 bg-fuchsia-100 rounded-16 p-16 lg:sticky lg:col-span-4 lg:top-16">
          <div className="relative w-[100px] h-[100px] mx-auto mb-8 md:w-[125px] md:h-[125px]">
            <Image
              src={user.image}
              alt={`${user.name} profile image`}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <h1 className="text-center">{user.name}</h1>
        </section>
        {user.posts.length > 0 ? (
          <section className="col-span-full mb-32 lg:col-start-5 lg:row-span-full">
            <h2 className="mb-16">
              Its {user.posts.length} post{user.posts.length > 1 ? 's' : ''}
            </h2>
            <PostList posts={user.posts} />
          </section>
        ) : (
          <div
            className="col-span-full relative flex justify-center items-center lg:col-start-5 lg:row-span-full"
            role="status"
          >
            <Blob className="w-full h-3/4 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
            <span className="text-m-4xl md:text-t-4xl text-center z-10">
              {user.name} hasn&apos;t created any posts yet.
            </span>
          </div>
        )}
      </main>
    </>
  )
}

export default UserPage
