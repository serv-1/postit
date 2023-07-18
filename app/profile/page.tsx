import Profile from 'app/pages/profile'
import type { Metadata } from 'next'
import { getCsrfToken, getSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import getUser from 'utils/functions/getUser'
import getPosts from 'utils/functions/getPosts'
import getUserFavoritePosts from 'utils/functions/getUserFavoritePosts'

export const metadata: Metadata = {
  title: 'Profile - PostIt',
}

export default async function Page() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/sign-in')
  }

  const user = await getUser(session.id)
  const posts = await getPosts(user.postsIds)
  const favPosts = await getUserFavoritePosts(user.favPostsIds)
  const csrfToken = await getCsrfToken()

  return <Profile user={{ ...user, posts, favPosts }} csrfToken={csrfToken} />
}
