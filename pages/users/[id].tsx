import axios from 'axios'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../../components/Header'
import PostList from '../../components/PostList'
import { IUser } from '../../types/common'
import Blob from '../../public/static/images/blob.svg'
import ChatFill from '../../public/static/images/chat-fill.svg'
import MainButton from '../../components/MainButton'

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
      <Header />
      <main className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid-rows-[auto,1fr] gap-x-24">
        <section className="col-span-full mb-32 bg-fuchsia-100 rounded-16 p-16">
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
          <section className="col-span-full mb-32">
            <h2 className="mb-16">Its {user.posts.length} posts</h2>
            <PostList posts={user.posts} />
          </section>
        ) : (
          <div
            className="col-span-full relative flex justify-center items-center"
            role="status"
          >
            <Blob className="w-full h-3/4 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
            <span className="text-m-4xl md:text-t-4xl text-center z-10">
              {user.name} hasn&apos;t created any posts yet.
            </span>
          </div>
        )}
        <MainButton
          bgColor={{ states: 'hover:bg-fuchsia-50' }}
          textColor={{ states: 'hover:text-fuchsia-900' }}
          radius="rounded-full"
          padding="p-0"
          className="w-48 h-48 shadow-[0_0_8px_rgba(192,38,211,0.75)] fixed bottom-8 right-8 flex justify-center items-center md:hidden"
        >
          <ChatFill className="w-24 h-24" />
        </MainButton>
      </main>
    </>
  )
}

export default User
