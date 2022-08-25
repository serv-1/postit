import Image from 'next/image'
import { useState } from 'react'

interface ChatMessageProps {
  message: string
  createdAt: Date
  image: string
  name: string
  isSignedInUser: boolean
}

const ChatMessage = (props: ChatMessageProps) => {
  const { message, createdAt, image, name, isSignedInUser } = props

  const [showDate, setShowDate] = useState(false)

  return (
    <div
      className={
        'relative flex flex-nowrap mb-32 cursor-pointer ' +
        (isSignedInUser ? 'flex-row-reverse' : 'flex-row')
      }
      onClick={() => setShowDate(!showDate)}
    >
      <div className="w-40 h-40">
        <Image
          src={image}
          alt={name + "'s profile picture"}
          objectFit="cover"
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
      <div
        className={
          'max-w-[248px] p-8 rounded-8 ' +
          (isSignedInUser ? 'mr-8 bg-fuchsia-200' : 'ml-8 bg-fuchsia-300')
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

export default ChatMessage
