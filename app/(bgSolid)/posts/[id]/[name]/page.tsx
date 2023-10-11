import PostPage from 'app/pages/post'
import type { Metadata } from 'next'
import getPost from 'functions/getPost'
import getUserPosts from 'functions/getUserPosts'
import getUser from 'functions/getUser'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'

interface Params {
  id: string
  name: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { name } = await getPost(params.id)

  return {
    title: name + ' - PostIt',
  }
}

export default async function Page({ params }: { params: Params }) {
  const post = await getPost(params.id)
  const postUser = await getUser(post.userId)
  const posts = await getUserPosts(
    postUser.postIds.filter((postId) => postId !== params.id)
  )
  const session = await getServerSession(nextAuthOptions)
  const user = session ? await getUser(session.id) : undefined

  return (
    <PostPage
      post={{ ...post, user: { id: postUser.id, name: postUser.name, posts } }}
      user={user}
    />
  )
}
