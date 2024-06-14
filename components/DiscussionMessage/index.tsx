import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import Image from 'next/image'
import { useState } from 'react'

interface DiscussionMessageProps {
  message: string
  createdAt: string
  authorImage?: string
  authorName: string
  isLeftAligned?: boolean
}

export default function DiscussionMessage({
  message,
  createdAt,
  authorImage,
  authorName,
  isLeftAligned,
}: DiscussionMessageProps) {
  const [showDate, setShowDate] = useState(false)
  const date = new Date(createdAt)

  return (
    <div
      className={
        'relative flex flex-nowrap gap-x-8 mb-32 cursor-pointer ' +
        (isLeftAligned ? 'flex-row' : 'flex-row-reverse')
      }
      onClick={() => setShowDate(!showDate)}
    >
      <Image
        src={
          authorImage
            ? NEXT_PUBLIC_AWS_URL + '/' + authorImage
            : NEXT_PUBLIC_DEFAULT_USER_IMAGE
        }
        alt={authorName + "'s profile picture"}
        width={40}
        height={40}
        className="rounded-full w-40 h-40 object-cover"
      />
      <div
        className={
          'max-w-[calc(100%-48px)] p-8 rounded-8 break-words ' +
          (isLeftAligned ? 'bg-fuchsia-300' : 'bg-fuchsia-200')
        }
      >
        {message}
      </div>
      <div
        className={
          'absolute -bottom-16 text-xs ' +
          (showDate ? 'block ' : 'hidden ') +
          (isLeftAligned ? 'left-48' : 'right-48')
        }
      >
        {date.toLocaleDateString()}, {date.toLocaleTimeString()}
      </div>
    </div>
  )
}
