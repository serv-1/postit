import type { Metadata } from 'next'
import getUser from 'functions/getUser'
import Image from 'next/image'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import PostList from 'components/PostList'
import Blob from 'public/static/images/blob.svg'
import getPosts from 'functions/getPosts'

interface Params {
  id: string
  name: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const user = await getUser(params.id)

  return {
    title: user!.name + "'s profile - PostIt",
  }
}

export default async function Page({ params }: { params: Params }) {
  const user = await getUser(params.id)
  const posts = await getPosts(user.postIds)

  return (
    <main className="grow flex flex-col lg:flex-row lg:items-start lg:gap-x-24">
      <section className="mb-32 bg-fuchsia-100 rounded-16 p-16 lg:sticky lg:top-16 lg:w-[384px] lg:shrink-0">
        <div className="w-[100px] h-[100px] mx-auto mb-8 md:w-[125px] md:h-[125px]">
          <Image
            src={
              user.image
                ? NEXT_PUBLIC_AWS_URL + '/' + user.image
                : NEXT_PUBLIC_DEFAULT_USER_IMAGE
            }
            width="100"
            height="100"
            alt={`${user.name}'s profile image`}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h1 className="text-center break-words">{user.name}</h1>
      </section>
      {posts.length > 0 ? (
        <section className="mb-32">
          <h2 className="mb-16">
            Its {posts.length} post{posts.length > 1 ? 's' : ''}
          </h2>
          <PostList posts={posts} />
        </section>
      ) : (
        <div
          className="grow self-stretch relative flex justify-center items-center"
          role="status"
        >
          <Blob className="w-full h-3/4 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
          <span className="text-m-4xl md:text-t-4xl text-center z-10">
            {user.name} hasn&apos;t created any posts yet.
          </span>
        </div>
      )}
    </main>
  )
}
