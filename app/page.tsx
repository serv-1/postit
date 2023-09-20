import type { Metadata } from 'next'
import Index from 'app/pages/root'

export const metadata: Metadata = {
  title: 'Home - PostIt',
}

export default function Page() {
  return <Index />
}
