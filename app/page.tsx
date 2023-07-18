import type { Metadata } from 'next'
import Index from 'app/pages'

export const metadata: Metadata = {
  title: 'Home - PostIt',
}

export default function Page() {
  return <Index />
}
