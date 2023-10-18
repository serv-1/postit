import Profile from 'app/pages/profile'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import getUser from 'functions/getUser'
import getPosts from 'functions/getPosts'
import getUserFavoritePosts from 'functions/getUserFavoritePosts'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'

export const metadata: Metadata = {
  title: 'Your Profile - PostIt',
}

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    redirect('/authentication')
  }

  const user = await getUser(session.id)

  if (!user) {
    throw new Error(USER_NOT_FOUND)
  }

  const posts = await getPosts(user.postIds)

  if (!posts) {
    throw new Error(POST_NOT_FOUND)
  }

  const favPosts = await getUserFavoritePosts(user.favPostIds)

  if (!favPosts) {
    throw new Error(POST_NOT_FOUND)
  }

  return <Profile user={{ ...user, posts, favPosts }} />
}
