import type { Metadata } from 'next'
import Forbidden from 'app/pages/403'

export const metadata: Metadata = {
  title: 'Forbidden - PostIt',
}

export default function Page() {
  return <Forbidden />
}
