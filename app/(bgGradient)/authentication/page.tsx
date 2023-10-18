import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import Authentication from 'app/pages/authentication'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { getProviders } from 'next-auth/react'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Authentication - PostIt',
}

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (session) {
    redirect('/profile')
  }

  const providers = await getProviders()

  return <Authentication providers={providers} />
}
