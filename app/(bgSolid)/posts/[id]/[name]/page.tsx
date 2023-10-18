import PostPage from 'app/pages/post'
import type { Metadata } from 'next'
import getPost from 'functions/getPost'
import getUserPosts from 'functions/getUserPosts'
import getUser from 'functions/getUser'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import { User } from 'types'

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

  const posts = await getUserPosts(
    postUser.postIds.filter((postId) => postId !== params.id)
  )

  if (!posts) {
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

  return (
    <PostPage
      post={{ ...post, user: { id: postUser.id, name: postUser.name, posts } }}
      user={user}
    />
  )
}
