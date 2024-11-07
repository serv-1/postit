'use client'

import formatToUrl from 'functions/formatToUrl'
import useEventListener from 'hooks/useEventListener'
import Link from 'next/link'
import { useState } from 'react'

interface PublicProfileLinkProps {
  id: string
  name: string
}

export default function PublicProfileLink(props: PublicProfileLinkProps) {
  const [name, setName] = useState(props.name)

  useEventListener('document', 'updateProfileUserName', (e) => {
    setName(e.detail.name)
  })

  return (
    <Link
      href={`/users/${props.id}/${formatToUrl(name)}`}
      className="bg-fuchsia-200 text-fuchsia-600 py-8 px-16 block shrink-0 text-center font-bold rounded hover:bg-fuchsia-300 transition-colors duration-200 md:h-40"
    >
      See my public profile
    </Link>
  )
}
