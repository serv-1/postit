import { getCsrfToken } from 'next-auth/react'
import CreateAPost from 'app/pages/create-a-post'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create a post - PostIt',
}

export default async function Page() {
  const csrfToken = await getCsrfToken()

  return <CreateAPost csrfToken={csrfToken} />
}
