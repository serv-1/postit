import axios from 'axios'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import PostList from '../../components/PostList'
import { IUser } from '../../types/common'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id

  try {
    const res = await axios.get<IUser>(`http://localhost:3000/api/users/${id}`)
    return { props: { user: res.data } }
  } catch (e) {
    return { notFound: true }
  }
}

interface UserProps {
  user: IUser
}

const User = ({ user }: UserProps) => {
  return (
    <>
      <Head>
        <title>{user.name}&apos;s profile - Filanad</title>
      </Head>
      <main className="py-32 grid grid-cols-4 md:grid-cols-8 gap-x-16 justify-center">
        <section className="col-span-full md:col-start-2 md:col-span-6 mb-32">
          <h1 className="text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16">
            {user.name}&apos;s profile
          </h1>
          <div className="text-center">
            <Image
              src={user.image}
              alt={`${user.name} profile image`}
              width={160}
              height={160}
              className="rounded-full"
            />
          </div>
        </section>
        {user.posts.length > 0 ? (
          <section className="col-span-full mb-32 grid grid-cols-4 md:grid-cols-8 gap-x-16 justify-center">
            <h2 className="col-span-full md:col-start-2 text-3xl md:text-t-3xl lg:text-d-3xl font-bold mb-16">
              <span className="text-indigo-600">{user.posts.length}</span> Posts
            </h2>
            <div className="col-span-full  grid grid-cols-4 md:grid-cols-8 lg:grid-cols-[repeat(6,72px)] gap-x-16 justify-center">
              <PostList posts={user.posts} />
            </div>
          </section>
        ) : (
          <div
            className="col-span-full text-3xl md:text-t-3xl lg:text-d-3xl text-center"
            data-testid="noPosts"
          >
            <span className="text-indigo-600">{user.name}</span> has no posts.
          </div>
        )}
      </main>
    </>
  )
}

export default User
