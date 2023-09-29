import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from 'contexts/toast'
import type { Discussion, NewDiscussionMessage } from 'types'
import getClientPusher from 'functions/getClientPusher'
import ChatMessage from 'components/ChatMessage'
import styles from 'styles/chatScrollbar.module.css'
import ajax from 'libs/ajax'
import type {
  DiscussionsIdGetData,
  DiscussionsIdGetError,
} from 'app/api/discussions/[id]/types'

type DiscussionDataState = Pick<
  Discussion,
  'channelName' | 'messages' | 'buyer' | 'seller'
>

interface ChatMessageListProps {
  discussionId?: string
}

export default function ChatMessageList({
  discussionId,
}: ChatMessageListProps) {
  const [discussionData, setDiscussionData] = useState<DiscussionDataState>()

  const { setToast } = useToast()
  const { data: session } = useSession() as { data: Session }

  const msgListRef = useRef<HTMLDivElement>(null)
  const pusher = useRef(getClientPusher())

  useEffect(() => {
    if (!discussionId) return

    async function getDiscussion() {
      const response = await ajax.get('/discussions/' + discussionId, {
        csrf: true,
      })

      if (!response.ok) {
        const { message }: DiscussionsIdGetError = await response.json()

        setToast({ message, error: true })

        return
      }

      const discussion: DiscussionsIdGetData = await response.json()

      setDiscussionData({
        messages: discussion.messages.map((message) => {
          return { ...message, createdAt: new Date(message.createdAt) }
        }),
        channelName: discussion.channelName,
        buyer: discussion.buyer,
        seller: discussion.seller,
      })
    }

    getDiscussion()
  }, [discussionId, setToast])

  useEffect(() => {
    const messages = discussionData?.messages

    if (!messages || !discussionId) return

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
  }, [session.id, setToast, discussionId, discussionData?.messages])

  useEffect(() => {
    const channelName = discussionData?.channelName

    if (!channelName) return

    const p = pusher.current
    const channel = p.subscribe('private-encrypted-' + channelName)

    const newMessageHandler = (msg: NewDiscussionMessage) => {
      setDiscussionData((prev) => {
        if (prev) {
          return {
            ...prev,
            messages: [
              ...prev.messages,
              { ...msg, createdAt: new Date(msg.createdAt) },
            ],
          }
        }
      })
    }

    channel.bind('new-message', newMessageHandler)

    return () => {
      channel.unbind('new-message', newMessageHandler)
    }
  }, [discussionData?.channelName])

  return (
    <div
      ref={msgListRef}
      className={
        'flex flex-col h-full overflow-y-auto px-8 md:px-[12px] md:mx-4 ' +
        styles.container
      }
    >
      {discussionData &&
        discussionData.messages.map(({ message, createdAt, userId }, i) => {
          const { buyer, seller } = discussionData

          return (
            <ChatMessage
              key={i}
              message={message}
              createdAt={createdAt}
              isSignedInUser={userId === session.id}
              name={userId === buyer.id ? buyer.name : seller.name}
              image={userId === buyer.id ? buyer.image : seller.image}
            />
          )
        })}
    </div>
  )
}
