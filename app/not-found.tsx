import type { Metadata } from 'next'
import NotFound from 'app/pages/404'

export const metadata: Metadata = {
  title: 'Not Found - PostIt',
}

export default function Page() {
  return <NotFound />
}
