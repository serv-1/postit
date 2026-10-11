import { useEffect, useRef, useState } from 'react'
import DiscussionMessage, {
  type DiscussionMessageProps,
} from 'components/DiscussionMessage'
import type { Discussion, UnArray, User } from 'types'
import usePusher from 'hooks/usePusher'

export interface DiscussionMessageListProps {
  signedInUser: User
  interlocutor: User | null
  messages: Discussion['messages']
  discussionId: string
  isModalOpen?: boolean
}

export default function DiscussionMessageList({
  signedInUser,
  interlocutor,
  messages: propMessages,
  discussionId,
  isModalOpen,
}: DiscussionMessageListProps) {
  const [messages, setMessages] = useState(propMessages)
  const msgListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!isModalOpen) return

    msgListRef.current?.scroll({
      top: msgListRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [isModalOpen, messages])

  usePusher<UnArray<Discussion['messages']>>(
    'private-encrypted-' + discussionId,
    'message:new',
    (message) => {
      setMessages((m) => [...m, message])
    },
  )

  return (
    <ul
      ref={msgListRef}
      className="flex flex-col h-full overflow-y-auto px-8 md:px-12 md:mx-4 scrollbar-thumb-fuchsia-200 scrollbar-track-transparent scrollbar-thin hover:scrollbar-thumb-fuchsia-300"
    >
      {messages.map((message, i) => {
        let author: DiscussionMessageProps['author'] = undefined
        let position: DiscussionMessageProps['position'] = 'left'

        if (message.userId) {
          let name = 'deleted'
          let image: string | undefined = undefined

          if (message.userId === signedInUser._id) {
            name = signedInUser.name
            image = signedInUser.image
            position = 'right'
          } else if (interlocutor) {
            name = interlocutor.name
            image = interlocutor.image
          }

          author = { name, image }
        }

        return (
          <li key={i}>
            <DiscussionMessage
              position={position}
              message={message.message}
              createdAt={message.createdAt}
              author={author}
            />
          </li>
        )
      })}
    </ul>
  )
}
