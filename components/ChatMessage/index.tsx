import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import Image from 'next/image'
import { useState } from 'react'

interface ChatMessageProps {
  message: string
  createdAt: Date
  image?: string
  name: string
  isSignedInUser: boolean
}

export default function ChatMessage({
  message,
  createdAt,
  image,
  name,
  isSignedInUser,
}: ChatMessageProps) {
  const [showDate, setShowDate] = useState(false)

  return (
    <div
      className={
        'relative flex flex-nowrap gap-x-8 mb-32 cursor-pointer ' +
        (isSignedInUser ? 'flex-row-reverse' : 'flex-row')
      }
      onClick={() => setShowDate(!showDate)}
    >
      <Image
        src={
          image
            ? NEXT_PUBLIC_AWS_URL + '/' + image
            : NEXT_PUBLIC_DEFAULT_USER_IMAGE
        }
        alt={name + "'s profile picture"}
        width={40}
        height={40}
        className="rounded-full w-40 h-40 object-cover"
      />
      <div
        className={
          'max-w-[calc(100%-48px)] p-8 rounded-8 break-words ' +
          (isSignedInUser ? 'bg-fuchsia-200' : 'bg-fuchsia-300')
        }
      >
        {message}
      </div>
      {showDate && (
        <div
          className={
            'absolute -bottom-16 text-xs ' +
            (isSignedInUser ? 'right-48' : 'left-48')
          }
        >
          {createdAt.toLocaleDateString()}, {createdAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
