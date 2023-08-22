import PostPage from 'app/pages/post'
import type { Metadata } from 'next'
import { getCsrfToken, getSession } from 'next-auth/react'
import getPost from 'utils/functions/getPost'
import getUserPosts from 'utils/functions/getUserPosts'
import getUser from 'utils/functions/getUser'

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
  const session = await getSession()
  const user = session ? await getUser(session.id) : undefined
  const csrfToken = await getCsrfToken()

  return (
    <PostPage
      post={{ ...post, user: { id: postUser.id, name: postUser.name, posts } }}
      user={user}
      csrfToken={csrfToken}
    />
  )
}
