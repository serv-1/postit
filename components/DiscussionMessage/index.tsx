import classNames from 'classnames'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'

export interface DiscussionMessageProps {
  message: string
  createdAt: string
  author?: {
    id: string
    name: string
    image?: string
  }
}

export default function DiscussionMessage({
  message,
  createdAt,
  author,
}: DiscussionMessageProps) {
  const [showDate, setShowDate] = useState(false)
  const session = useSession()
  const isAuthor = session.data!.id === author?.id
  const date = new Date(createdAt)

  let imgSrc = NEXT_PUBLIC_DEFAULT_USER_IMAGE
  let imgAlt = 'Default profile picture'

  if (author) {
    if (author.image) {
      imgSrc = NEXT_PUBLIC_AWS_URL + '/' + author.image
    }

    imgAlt = author.name + "'s profile picture"
  }

  return (
    <div
      className={classNames(
        'relative flex flex-nowrap gap-x-8 mb-32 cursor-pointer',
        isAuthor ? 'flex-row-reverse' : 'flex-row'
      )}
      onClick={() => setShowDate(!showDate)}
    >
      <Image
        src={imgSrc}
        alt={imgAlt}
        width={40}
        height={40}
        className="rounded-full w-40 h-40 object-cover"
      />
      <div
        className={classNames(
          'max-w-[calc(100%-48px)] p-8 rounded-8 break-words',
          isAuthor ? 'bg-fuchsia-200' : 'bg-fuchsia-300'
        )}
      >
        {message}
      </div>
      <div
        className={classNames(
          'absolute -bottom-16 text-xs',
          showDate ? 'block' : 'hidden',
          isAuthor ? 'right-48' : 'left-48'
        )}
      >
        {date.toLocaleDateString()}, {date.toLocaleTimeString()}
      </div>
    </div>
  )
}
