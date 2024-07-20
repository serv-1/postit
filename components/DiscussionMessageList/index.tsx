import { useEffect, useRef } from 'react'
import DiscussionMessage, {
  type DiscussionMessageProps,
} from 'components/DiscussionMessage'
import type { DiscussionsIdGetData } from 'app/api/discussions/[id]/types'
import type { User } from 'types'

export interface DiscussionMessageListProps {
  signedInUser: User
  interlocutor: User | null
  messages: DiscussionsIdGetData['messages']
}

export default function DiscussionMessageList({
  signedInUser,
  interlocutor,
  messages,
}: DiscussionMessageListProps) {
  const msgListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    msgListRef.current?.scroll({
      top: msgListRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  return (
    <ul
      ref={msgListRef}
      className="flex flex-col h-full overflow-y-auto px-8 md:px-[12px] md:mx-4 chatScrollbar"
    >
      {messages.map((message, i) => {
        let author: DiscussionMessageProps['author'] = undefined

        if (message.userId) {
          let name = 'deleted'
          let image: string | undefined = undefined

          if (message.userId === signedInUser._id) {
            name = signedInUser.name
            image = signedInUser.image
          } else if (interlocutor) {
            name = interlocutor.name
            image = interlocutor.image
          }

          author = { id: message.userId, name, image }
        }

        return (
          <li key={i}>
            <DiscussionMessage
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
