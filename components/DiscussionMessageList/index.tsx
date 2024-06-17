import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import useToast from 'hooks/useToast'
import DiscussionMessage from 'components/DiscussionMessage'
import ajax from 'libs/ajax'
import type {
  DiscussionsIdGetData,
  DiscussionsIdGetError,
} from 'app/api/discussions/[id]/types'
import type { UnArray } from 'types'

export interface DiscussionMessageListProps {
  discussionId: string
  messages: (UnArray<DiscussionsIdGetData['messages']> & {
    authorName: string
    authorImage?: string
  })[]
}

export default function DiscussionMessageList({
  discussionId,
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
      {messages.map((message, i) => (
        <li key={i}>
          <DiscussionMessage
            message={message.message}
            createdAt={message.createdAt}
            isLeftAligned={message.userId !== session.id}
            authorName={message.authorName}
            authorImage={message.authorImage}
          />
        </li>
      ))}
    </ul>
  )
}
