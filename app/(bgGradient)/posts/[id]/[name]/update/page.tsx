import UpdatePost from 'app/pages/postUpdate'
import type { Metadata } from 'next'
import getPost from 'functions/getPost'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

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
    title: 'Update ' + name + ' - PostIt',
  }
}

export default async function Page({ params }: { params: Params }) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    redirect('/authentication')
  }

  const post = await getPost(params.id)

  return <UpdatePost post={post} />
}
