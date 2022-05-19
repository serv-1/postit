import axios from 'axios'
import { GetServerSideProps } from 'next'
import { IPost, IUser } from '../../../../types/common'
import addSpacesToNb from '../../../../utils/functions/addSpacesToNb'
import Head from 'next/head'
import Link from '../../../../components/Link'
import PostList from '../../../../components/PostList'
import Image from 'next/image'
import ArrowLeft from '../../../../public/static/images/arrow-left.svg'
import ChatFill from '../../../../public/static/images/chat-fill.svg'
import SeeAllPhotosModal from '../../../../components/SeeAllPhotosModal'
import Header from '../../../../components/Header'
import DotButton from '../../../../components/DotButton'
import Button from '../../../../components/Button'
import { getSession } from 'next-auth/react'
import PostsNameFavoriteButton from '../../../../components/PostsNameFavoriteButton'
import PostsNameUpdateButtons from '../../../../components/PostsNameUpdateButtons'
import formatToUrl from '../../../../utils/functions/formatToUrl'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id
  const session = await getSession(ctx)

  try {
    const post = await axios.get<IPost>(`http://localhost:3000/api/posts/${id}`)
    const user = session
      ? await axios.get<IUser>(`http://localhost:3000/api/users/${session.id}`)
      : undefined

    return { props: { post: post.data, user: user?.data } }
  } catch (e) {
    return { notFound: true }
  }
}

interface NameProps {
  post: IPost
  user?: IUser
}

const Name = ({ post, user }: NameProps) => {
  return (
    <>
      <Head>
        <title>{post.name} - Filanad</title>
      </Head>
      <Header className="hidden md:flex" />
      <main className="grid grid-cols-4 md:grid-cols-8 md:grid-rows-[auto,1fr] lg:grid-cols-12 gap-x-24">
        <div className="relative col-span-full h-[360px] -ml-16 w-[calc(100%+32px)] md:col-span-5 md:ml-0 md:w-full md:rounded-16 md:overflow-hidden lg:col-span-8">
          <Image
            src={post.images[0]}
            alt={post.name}
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute top-8 left-8 md:hidden">
            <DotButton
              onClick={() => window.history.back()}
              aria-label="Go back to the previous page"
            >
              <ArrowLeft className="w-full h-full" />
            </DotButton>
          </div>
          {user?.id === post.user.id ? (
            <div className="absolute top-8 right-8 md:hidden">
              <PostsNameUpdateButtons
                id={post.id}
                name={post.name}
                isDotButton
              />
            </div>
          ) : (
            <PostsNameFavoriteButton postId={post.id} user={user} />
          )}
          <SeeAllPhotosModal sources={post.images} />
        </div>
        <div className="col-span-full md:col-span-3 md:sticky md:top-16 lg:col-span-4">
          <div className="md:bg-fuchsia-100 md:rounded-16 md:p-16 md:text-t-xl md:font-bold">
            {user?.id === post.user.id ? (
              <span className="hidden md:inline">Manage your post</span>
            ) : (
              <span>
                Posted by{' '}
                <Link
                  href={`/users/${post.user.id}/${formatToUrl(post.user.name)}`}
                  className="text-fuchsia-600 hover:underline"
                >
                  {post.user.name}
                </Link>
              </span>
            )}
            <div className="hidden md:block md:mt-16 md:text-base">
              {user?.id === post.user.id ? (
                <div className="flex flex-row flex-nowrap">
                  <PostsNameUpdateButtons id={post.id} name={post.name} />
                </div>
              ) : (
                <Button color="primary" fullWidth>
                  Contact
                </Button>
              )}
            </div>
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
        {(!user || user.id !== post.user.id) && post.user.posts.length > 0 && (
          <section className="col-span-full mb-32 md:col-span-5 lg:col-span-8">
            <h2 className="mb-16">
              <Link
                href={`/users/${post.user.id}/${formatToUrl(post.user.name)}`}
                className="text-fuchsia-600 hover:underline"
              >
                {post.user.name}
              </Link>
              {"'"}s other posts
            </h2>
            <PostList posts={post.user.posts} columns={2} />
          </section>
        )}
        <div className="fixed bottom-8 right-8 md:hidden">
          <DotButton>
            <ChatFill className="w-full h-full" />
          </DotButton>
        </div>
      </main>
    </>
  )
}

export default Name
