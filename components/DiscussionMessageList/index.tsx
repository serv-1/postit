import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import useToast from 'hooks/useToast'
import DiscussionMessage, {
  type DiscussionMessageProps,
} from 'components/DiscussionMessage'
import ajax from 'libs/ajax'
import type {
  DiscussionsIdGetData,
  DiscussionsIdGetError,
} from 'app/api/discussions/[id]/types'
import type { User } from 'types'

export interface DiscussionMessageListProps {
  discussionId: string
  signedInUser: User
  interlocutor: User | null
  messages: DiscussionsIdGetData['messages']
}

export default function DiscussionMessageList({
  discussionId,
  signedInUser,
  interlocutor,
  messages,
}: DiscussionMessageListProps) {
  const { setToast } = useToast()
  const { data: session } = useSession() as { data: Session }
  const msgListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    msgListRef.current?.scroll({
      top: msgListRef.current.scrollHeight,
      behavior: 'smooth',
    })

    const lastMsg = messages[messages.length - 1]

    if (session.id !== lastMsg.userId && !lastMsg.seen) {
      const updateUnseenMessages = async () => {
        const response = await ajax.put('/discussions/' + discussionId, null, {
          csrf: true,
        })

        if (!response.ok) {
          const { message }: DiscussionsIdGetError = await response.json()

          setToast({ message, error: true })
        }
      }

      updateUnseenMessages()
    }
  }, [session.id, setToast, messages, discussionId])

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
