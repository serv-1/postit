import axios from 'axios'
import { GetServerSideProps } from 'next'
import { LightPost, Post, User } from '../../../../types/common'
import addSpacesToNb from '../../../../utils/functions/addSpacesToNb'
import Head from 'next/head'
import Link from '../../../../components/Link'
import PostList from '../../../../components/PostList'
import Image from 'next/image'
import ArrowLeft from '../../../../public/static/images/arrow-left.svg'
import SeeAllPhotosModal from '../../../../components/SeeAllPhotosModal'
import Header from '../../../../components/Header'
import DotButton from '../../../../components/DotButton'
import { getCsrfToken, getSession } from 'next-auth/react'
import PostPageFavoriteButton from '../../../../components/PostPageFavoriteButton'
import PostPageUpdateButtons from '../../../../components/PostPageUpdateButtons'
import formatToUrl from '../../../../utils/functions/formatToUrl'
import PostPageMap from '../../../../components/PostPageMap'
import PostPageContactModal from '../../../../components/PostPageContactModal'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const postId = ctx.params?.id
  const session = await getSession(ctx)

  try {
    let url = 'http://localhost:3000/api/posts/' + postId
    const { data: post } = await axios.get<Post>(url)

    url = 'http://localhost:3000/api/users/' + post.userId
    const { data: user } = await axios.get<User>(url)

    const postsIds = user.postsIds.filter((id) => id !== postId)
    const posts: LightPost[] = []

    for (const postId of postsIds) {
      const url = 'http://localhost:3000/api/posts/' + postId
      const { data } = await axios.get<Post>(url)
      const { id, name, price, address, images } = data
      posts.push({ id, name, price, address, image: images[0] })
    }

    const props: PostPageProps = {
      post: { ...post, user: { id: user.id, name: user.name, posts } },
    }

    if (session) {
      const url = 'http://localhost:3000/api/users/' + session.id
      props.user = (await axios.get<User>(url)).data
    }

    return { props: { ...props, csrfToken: await getCsrfToken(ctx) } }
  } catch (e) {
    return { notFound: true }
  }
}

export interface PostPageProps {
  post: Omit<Post, 'userId'> & {
    user: Pick<User, 'id' | 'name'> & { posts: LightPost[] }
  }
  user?: User
  csrfToken?: string
}

const PostPage = ({ post, user, csrfToken }: PostPageProps) => {
  return (
    <>
      <Head>
        <title>{post.name} - Filanad</title>
      </Head>
      <div className="hidden md:flex">
        <Header />
      </div>
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
              <PostPageUpdateButtons
                id={post.id}
                name={post.name}
                isDotButton
              />
            </div>
          ) : (
            <PostPageFavoriteButton
              postId={post.id}
              favPostsIds={user?.favPostsIds}
            />
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
            <div className="md:mt-16 md:text-base">
              {user?.id === post.user.id ? (
                <div className="hidden md:flex flex-row flex-nowrap">
                  <PostPageUpdateButtons id={post.id} name={post.name} />
                </div>
              ) : (
                <PostPageContactModal
                  postId={post.id}
                  postName={post.name}
                  sellerId={post.user.id}
                  csrfToken={csrfToken}
                  discussionId={
                    user?.discussionsIds.filter((id) => {
                      if (post.discussionsIds.includes(id)) return id
                    })[0]
                  }
                />
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
          <PostPageMap address={post.address} latLon={post.latLon} />
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
      </main>
    </>
  )
}

export default PostPage
