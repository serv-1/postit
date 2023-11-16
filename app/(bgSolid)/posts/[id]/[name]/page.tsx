import type { Metadata } from 'next'
import getPost from 'functions/getPost'
import getUserPosts from 'functions/getUserPosts'
import getUser from 'functions/getUser'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import type { User } from 'types'
import Image from 'next/image'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'
import PostPageFavoriteButton from 'components/PostPageFavoriteButton'
import SeeAllPhotosModal from 'components/SeeAllPhotosModal'
import formatToUrl from 'functions/formatToUrl'
import Link from 'next/link'
import ContactModal from 'components/ContactModal'
import addSpacesToNum from 'functions/addSpacesToNum'
import PostPageMap from 'components/PostPageMap'
import PostList from 'components/PostList'
import PreviousPageButton from 'components/PreviousPageButton'
import Pencil from 'public/static/images/pencil.svg'
import DeletePostButton from 'components/DeletePostButton'
import getCommonItem from 'functions/getCommonItem'

interface Params {
  id: string
  name: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const post = await getPost(params.id)

  return {
    title: (post as NonNullable<typeof post>).name + ' - PostIt',
  }
}

export default async function Page({ params }: { params: Params }) {
  const post = await getPost(params.id)

  if (!post) {
    throw new Error(POST_NOT_FOUND)
  }

  const postUser = await getUser(post.userId)

  if (!postUser) {
    throw new Error(USER_NOT_FOUND)
  }

  const postUserPosts = await getUserPosts(
    postUser.postIds.filter((postId) => postId !== params.id)
  )

  if (!postUserPosts) {
    throw new Error(POST_NOT_FOUND)
  }

  const session = await getServerSession(nextAuthOptions)

  let user: User | undefined = undefined

  if (session) {
    user = await getUser(session.id)

    if (!user) {
      throw new Error(USER_NOT_FOUND)
    }
  }

  const isAuthor = user && user.id === postUser.id

  return (
    <main className="grow md:grid md:grid-cols-[calc((100%/3*2)-12px)_calc((100%/3)-12px)] md:gap-x-24 md:items-start md:content-start">
      <div className="relative h-[360px] -ml-16 w-[calc(100%+32px)] md:ml-0 md:w-auto">
        <Image
          src={NEXT_PUBLIC_AWS_URL + '/' + post.images[0]}
          alt={post.name}
          width="340"
          height="360"
          className="w-full h-full object-cover md:rounded-16"
          priority
        />
        <div className="absolute top-8 left-8 md:hidden">
          <PreviousPageButton />
        </div>
        {isAuthor ? (
          <div className="absolute top-8 right-8 md:hidden flex">
            <Link
              href={`/posts/${post.id}/${formatToUrl(post.name)}/update`}
              className="mr-8 round-btn"
              aria-label="Edit"
            >
              <Pencil className="w-full h-full" />
            </Link>
            <DeletePostButton postId={post.id} isRound />
          </div>
        ) : (
          <PostPageFavoriteButton
            postId={post.id}
            favPostIds={user?.favPostIds}
          />
        )}
        <SeeAllPhotosModal sources={post.images} />
      </div>
      {!isAuthor && (
        <div className="md:hidden">
          Posted by{' '}
          <Link
            href={`/users/${postUser.id}/${formatToUrl(postUser.name)}`}
            className="text-fuchsia-600 hover:underline break-all"
          >
            {postUser.name}
          </Link>
        </div>
      )}
      <aside className="hidden md:block sticky top-16 bg-fuchsia-100 rounded-16 p-16">
        <div className="mb-16 text-t-xl font-bold">
          {isAuthor ? (
            'Manage your post'
          ) : (
            <>
              Posted by{' '}
              <Link
                href={`/users/${postUser.id}/${formatToUrl(postUser.name)}`}
                className="text-fuchsia-600 hover:underline break-all"
              >
                {postUser.name}
              </Link>
            </>
          )}
        </div>
        {isAuthor ? (
          <div className="flex flex-row flex-nowrap">
            <Link
              href={`/posts/${post.id}/${formatToUrl(post.name)}/update`}
              className="w-full text-center mr-8 primary-btn"
            >
              Edit
            </Link>
            <DeletePostButton postId={post.id} />
          </div>
        ) : (
          <ContactModal
            postId={post.id}
            postName={post.name}
            sellerId={postUser.id}
            discussionId={
              user && getCommonItem(user.discussionIds, post.discussionIds)
            }
          />
        )}
      </aside>
      <section className="my-32">
        <h1 className="mb-8 break-words">{post.name}</h1>
        <span className="text-m-2xl font-bold md:text-t-2xl">
          {addSpacesToNum(post.price)}€
        </span>
        <p className="my-16 break-words">{post.description}</p>
        <PostPageMap address={post.address} latLon={post.latLon} />
      </section>
      {!isAuthor && postUserPosts.length > 0 && (
        <section className="mb-32 md:col-start-1">
          <h2 className="mb-16">
            <Link
              href={`/users/${postUser.id}/${formatToUrl(postUser.name)}`}
              className="text-fuchsia-600 hover:underline break-words"
            >
              {postUser.name}
            </Link>
            {"'"}s other posts
          </h2>
          <PostList posts={postUserPosts} />
        </section>
      )}
      {!isAuthor && (
        <div className="md:hidden">
          <ContactModal
            hasFloatingBtn
            postId={post.id}
            postName={post.name}
            sellerId={postUser.id}
            discussionId={
              user && getCommonItem(user.discussionIds, post.discussionIds)
            }
          />
        </div>
      )}
    </main>
  )
}
