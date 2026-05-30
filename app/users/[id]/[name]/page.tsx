import type { Metadata } from 'next'
import getUser from 'functions/getUser'
import Image from 'next/image'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import PostList from 'components/PostList'
import BlobSvg from 'components/BlobSvg'
import getPosts from 'functions/getPosts'

type Params = Promise<{
  id: string
  name: string
}>

export async function generateMetadata(props: {
  params: Params
}): Promise<Metadata> {
  const params = await props.params
  const user = await getUser(params.id)

  return {
    title: user!.name + "'s profile - PostIt",
  }
}

export default async function Page(props: { params: Params }) {
  const params = await props.params
  const user = await getUser(params.id)
  const posts = await getPosts(user.postIds)

  return (
    <main className="grow flex flex-col lg:flex-row lg:items-start lg:gap-x-24">
      <section className="mb-32 bg-fuchsia-100 rounded-2xl p-16 lg:sticky lg:top-16 lg:w-sm lg:shrink-0">
        <div className="w-100 h-100 mx-auto mb-8 md:w-125 md:h-125">
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
        <h1 className="text-center wrap-break-words">{user.name}</h1>
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
          <BlobSvg className="w-full h-3/4 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-fuchsia-100" />
          <span className="text-m-4xl md:text-t-4xl text-center z-10">
            {user.name}&nbsp;hasn&apos;t created any posts yet.
          </span>
        </div>
      )}
    </main>
  )
}
