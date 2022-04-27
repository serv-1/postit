import axios from 'axios'
import { GetServerSideProps } from 'next'
import { IPost } from '../../../types/common'
import addSpacesToNb from '../../../utils/functions/addSpacesToNb'
import Head from 'next/head'
import Link from '../../../components/Link'
import PostList from '../../../components/PostList'
import Image from 'next/image'
import ArrowLeft from '../../../public/static/images/arrow-left.svg'
import Heart from '../../../public/static/images/heart.svg'
import HeartFill from '../../../public/static/images/heart-fill.svg'
import ChatFill from '../../../public/static/images/chat-fill.svg'
import PostsSeeAllPhotosModal from '../../../components/PostsSeeAllPhotosModal'
import MainButton from '../../../components/MainButton'
import Header from '../../../components/Header'

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
      <Header className="hidden md:flex" />
      <main className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-24">
        <div className="relative col-span-full h-[360px] -ml-16 w-[calc(100%+32px)] md:col-span-5 md:ml-0 md:w-full md:rounded-16 md:overflow-hidden lg:col-span-8">
          <Image
            src={post.images[0]}
            alt={post.name}
            layout="fill"
            objectFit="cover"
            priority
          />
          <button
            className="w-48 h-48 bg-fuchsia-50 text-fuchsia-600 rounded-full shadow-[0_2px_8px_rgba(112,26,117,0.25)] absolute top-8 left-8 p-8 hover:text-fuchsia-50 hover:bg-fuchsia-900 transition-colors duration-200 cursor-pointer md:hidden"
            onClick={() => window.history.back()}
            aria-label="Go back to the previous page"
          >
            <ArrowLeft className="w-full h-full" />
          </button>
          <div className="w-48 h-48 bg-fuchsia-50 text-fuchsia-600 rounded-full shadow-[0_2px_8px_rgba(112,26,117,0.25)] absolute top-8 right-8 p-8 transition-colors duration-200 group cursor-pointer">
            <Heart className="w-full h-full group-hover:opacity-0 transition-opacity duration-200" />
            <HeartFill className="w-full h-full opacity-0 group-hover:opacity-100 group-hover:animate-[heartbeat_1s_linear_infinite] transition-opacity duration-200 relative -top-full" />
          </div>
          <PostsSeeAllPhotosModal images={post.images} />
        </div>
        <div className="col-span-full md:col-span-3 md:sticky md:top-16 lg:col-span-4">
          <div className="md:bg-fuchsia-100 md:rounded-16 md:p-16 md:text-t-xl md:font-bold">
            Posted by{' '}
            <Link href={`/users/${post.user.id}`} className="text-fuchsia-600">
              {post.user.name}
            </Link>
            <MainButton className="hidden md:block md:text-base md:w-full md:mt-16">
              Contact
            </MainButton>
          </div>
        </div>
        <section className="col-span-full my-32 md:col-span-5 lg:col-span-8">
          <h1 className="mb-8">{post.name}</h1>
          <span className="text-m-2xl font-bold md:text-t-2xl">
            {addSpacesToNb(post.price)}€
          </span>
          <p className="my-16">{post.description}</p>
          <figure>
            <div className="h-[200px] bg-fuchsia-200 rounded-8 lg:h-[250px]"></div>
            <figcaption className="text-center">
              Location name (work in progress)
            </figcaption>
          </figure>
        </section>
        {post.user.posts.length > 0 && (
          <section className="col-span-full mb-32 md:col-span-5 lg:col-span-8">
            <h2 className="mb-16">
              <Link
                href={`/users/${post.user.id}`}
                className="text-fuchsia-600"
              >
                {post.user.name}
              </Link>
              {"'"}s other posts
            </h2>
            <PostList posts={post.user.posts} columns={2} />
          </section>
        )}
        <div className="w-48 h-48 bg-fuchsia-600 text-fuchsia-50 rounded-full shadow-[0_0_8px_rgba(192,38,211,0.75)] fixed bottom-8 right-8 flex justify-center items-center hover:bg-fuchsia-50 hover:text-fuchsia-900 transition-colors duration-200 cursor-pointer md:hidden">
          <ChatFill className="w-24 h-24" />
        </div>
      </main>
    </>
  )
}

export default Post
