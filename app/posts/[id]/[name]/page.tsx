import type { Metadata } from 'next'
import getPost from 'functions/getPost'
import getPosts from 'functions/getPosts'
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
import ContactButton from 'components/ContactButton'

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

  return { title: post!.name + ' - PostIt' }
}

export default async function Page({ params }: { params: Params }) {
  const post = await getPost(params.id)

  if (!post) {
    throw new Error(POST_NOT_FOUND)
  }

  const seller = await getUser(post.userId)

  if (!seller) {
    throw new Error(USER_NOT_FOUND)
  }

  const sellerPosts = await getPosts(
    seller.postIds.filter((postId) => postId !== params.id)
  )

  if (!sellerPosts) {
    throw new Error(POST_NOT_FOUND)
  }

  const session = await getServerSession(nextAuthOptions)

  let user: User | undefined = undefined
  let isSeller = false
  let discussionId: string | undefined = undefined
  let isDiscussionHidden: boolean | undefined = undefined

  if (session) {
    if (seller._id === session.id) {
      user = seller
      isSeller = true
    } else {
      user = await getUser(session.id)

      if (!user) {
        throw new Error(USER_NOT_FOUND)
      }

      const postSet = new Set(post.discussionIds)

      for (const discussion of user.discussions) {
        if (postSet.has(discussion.id)) {
          discussionId = discussion.id
          isDiscussionHidden = discussion.hidden

          break
        }
      }
    }
  }

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
        {isSeller ? (
          <div className="absolute top-8 right-8 md:hidden flex">
            <Link
              href={`/posts/${post._id}/${formatToUrl(post.name)}/update`}
              className="mr-8 round-btn"
              aria-label="Edit"
            >
              <Pencil className="w-full h-full" />
            </Link>
            <DeletePostButton postId={post._id} isRound />
          </div>
        ) : (
          <PostPageFavoriteButton
            postId={post._id}
            favPostIds={user?.favPostIds}
          />
        )}
        <SeeAllPhotosModal sources={post.images} />
      </div>
      {!isSeller && (
        <div className="md:hidden">
          Posted by{' '}
          <Link
            href={`/users/${seller._id}/${formatToUrl(seller.name)}`}
            className="text-fuchsia-600 hover:underline break-all"
          >
            {seller.name}
          </Link>
        </div>
      )}
      <div className="fixed bottom-8 right-8 z-[1001] md:sticky md:top-16 md:z-auto md:bg-fuchsia-100 md:rounded-16 md:p-16">
        <div className="hidden md:block mb-16 text-t-xl font-bold">
          {isSeller ? (
            'Manage your post'
          ) : (
            <>
              Posted by{' '}
              <Link
                href={`/users/${seller._id}/${formatToUrl(seller.name)}`}
                className="text-fuchsia-600 hover:underline break-all"
              >
                {seller.name}
              </Link>
            </>
          )}
        </div>
        {isSeller ? (
          <div className="hidden md:flex md:flex-row md:flex-nowrap">
            <Link
              href={`/posts/${post._id}/${formatToUrl(post.name)}/update`}
              className="w-full text-center mr-8 primary-btn"
            >
              Edit
            </Link>
            <DeletePostButton postId={post._id} />
          </div>
        ) : user ? (
          <ContactModal
            postId={post._id}
            postName={post.name}
            sellerId={seller._id}
            discussionId={discussionId}
            isDiscussionHidden={isDiscussionHidden}
          />
        ) : (
          <ContactButton />
        )}
      </div>
      <section className="my-32">
        <h1 className="mb-8 break-words">{post.name}</h1>
        <span className="text-m-2xl font-bold md:text-t-2xl">
          {addSpacesToNum(post.price)}€
        </span>
        <p className="my-16 break-words">{post.description}</p>
        <PostPageMap address={post.address} latLon={post.latLon} />
      </section>
      {!isSeller && sellerPosts.length > 0 && (
        <section className="mb-32 md:col-start-1">
          <h2 className="mb-16">
            <Link
              href={`/users/${seller._id}/${formatToUrl(seller.name)}`}
              className="text-fuchsia-600 hover:underline break-words"
            >
              {seller.name}
            </Link>
            {"'"}s other posts
          </h2>
          <PostList posts={sellerPosts} />
        </section>
      )}
    </main>
  )
}
