import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import CreateAPost from 'app/pages/create-a-post'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Create a post - PostIt',
}

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    redirect('/authentication')
  }

  return <CreateAPost />
}
