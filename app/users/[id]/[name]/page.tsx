import PublicProfile from 'app/pages/publicProfile'
import type { Metadata } from 'next'
import getPosts from 'functions/getPosts'
import getUser from 'functions/getUser'

interface Params {
  id: string
  name: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { name } = await getUser(params.id)

  return {
    title: name + "'s profile - PostIt",
  }
}

export default async function Page({ params }: { params: Params }) {
  const user = await getUser(params.id)
  const posts = await getPosts(user.postIds)

  return <PublicProfile user={{ ...user, posts }} />
}
