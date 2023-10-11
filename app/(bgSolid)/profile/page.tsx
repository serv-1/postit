import Profile from 'app/pages/profile'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import getUser from 'functions/getUser'
import getPosts from 'functions/getPosts'
import getUserFavoritePosts from 'functions/getUserFavoritePosts'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'

export const metadata: Metadata = {
  title: 'Profile - PostIt',
}

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    redirect('/authentication')
  }

  const user = await getUser(session.id)
  const posts = await getPosts(user.postIds)
  const favPosts = await getUserFavoritePosts(user.favPostIds)

  return <Profile user={{ ...user, posts, favPosts }} />
}
