'use client'

import useEventListener from 'hooks/useEventListener'
import { useState } from 'react'

interface ProfileUserNameProps {
  name: string
}

export default function ProfileUserName(props: ProfileUserNameProps) {
  const [name, setName] = useState(props.name)

  useEventListener(document, 'updateProfileUserName', (e) => {
    setName(e.detail.name)
  })

  return <h1 className="truncate w-full mr-8 md:w-auto md:mr-16">{name}</h1>
}
