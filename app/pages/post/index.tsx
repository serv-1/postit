'use client'

import DotButton from 'components/DotButton'
import Header from 'components/Header'
import PostList from 'components/PostList'
import PostPageContactModal from 'components/PostPageContactModal'
import PostPageFavoriteButton from 'components/PostPageFavoriteButton'
import PostPageMap from 'components/PostPageMap'
import PostPageUpdateButtons from 'components/PostPageUpdateButtons'
import SeeAllPhotosModal from 'components/SeeAllPhotosModal'
import Image from 'next/image'
import Link from 'next/link'
import type { Post, User, UserPost } from 'types'
import addSpacesToNum from 'functions/addSpacesToNum'
import formatToUrl from 'functions/formatToUrl'
import ArrowLeft from 'public/static/images/arrow-left.svg'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'
import PageWrapper from 'components/PageWrapper'

export default function PostPage({
  post,
  user,
}: {
  post: Omit<Post, 'userId'> & {
    user: Pick<User, 'id' | 'name'> & { posts: UserPost[] }
  }
  user?: User
}) {
  return (
    <PageWrapper>
      <div className="hidden md:block">
        <Header />
      </div>
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
              favPostIds={user?.favPostIds}
            />
          )}
          <SeeAllPhotosModal sources={post.images} />
        </div>
        <div className="md:sticky md:top-16 md:bg-fuchsia-100 md:rounded-16 md:p-16 md:text-t-xl md:font-bold">
          {user?.id === post.user.id ? (
            <span className="hidden md:inline">Manage your post</span>
          ) : (
            <span className="break-all">
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
                discussionId={
                  user?.discussionIds.filter((id) => {
                    if (post.discussionIds.includes(id)) return id
                  })[0]
                }
              />
            )}
          </div>
        </div>
        <section className="my-32">
          <h1 className="mb-8 break-words">{post.name}</h1>
          <span className="text-m-2xl font-bold md:text-t-2xl">
            {addSpacesToNum(post.price)}€
          </span>
          <p className="my-16 break-words">{post.description}</p>
          <PostPageMap address={post.address} latLon={post.latLon} />
        </section>
        {(!user || user.id !== post.user.id) && post.user.posts.length > 0 && (
          <section className="mb-32 md:col-start-1">
            <h2 className="mb-16">
              <Link
                href={`/users/${post.user.id}/${formatToUrl(post.user.name)}`}
                className="text-fuchsia-600 hover:underline break-words"
              >
                {post.user.name}
              </Link>
              {"'"}s other posts
            </h2>
            <PostList posts={post.user.posts} />
          </section>
        )}
      </main>
    </PageWrapper>
  )
}
