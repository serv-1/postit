import Authentication from 'app/pages/authentication'
import type { Metadata } from 'next'
import { getProviders } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Authentication - PostIt',
}

export default async function Page() {
  const providers = await getProviders()

  return <Authentication providers={providers} />
}
