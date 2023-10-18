import PublicProfile from 'app/pages/publicProfile'
import type { Metadata } from 'next'
import getPosts from 'functions/getPosts'
import getUser from 'functions/getUser'
import { User } from 'types'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'

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
    title: (user as User).name + "'s profile - PostIt",
  }
}

export default async function Page({ params }: { params: Params }) {
  const user = await getUser(params.id)

  if (!user) {
    throw new Error(USER_NOT_FOUND)
  }

  const posts = await getPosts(user.postIds)

  if (!posts) {
    throw new Error(POST_NOT_FOUND)
  }

  return <PublicProfile user={{ ...user, posts }} />
}
