import axios from 'axios'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../contexts/toast'
import { Discussion, Message, JSONDiscussion, UnArray } from '../types/common'
import getAxiosError from '../utils/functions/getAxiosError'
import getClientPusher from '../utils/functions/getClientPusher'
import ChatMessage from './ChatMessage'
import styles from '../styles/chatScrollbar.module.css'

interface DiscussionDataState {
  channelName: string
  messages: Message[]
  buyer: Discussion['buyer']
  seller: Discussion['seller']
}

interface ChatMessageListProps {
  csrfToken?: string
  discussionId?: string
}

const ChatMessageList = (props: ChatMessageListProps) => {
  const { csrfToken, discussionId } = props

  const [discussionData, setDiscussionData] = useState<DiscussionDataState>()

  const { setToast } = useToast()
  const { data: session } = useSession() as { data: Session }

  const msgListRef = useRef<HTMLDivElement>(null)
  const pusher = useRef(getClientPusher())

  useEffect(() => {
    if (!discussionId) return

    const getDiscussion = async () => {
      try {
        const url = `/api/discussions/${discussionId}?csrfToken=${csrfToken}`
        const { data } = await axios.get<JSONDiscussion>(url)
        const { messages: m, channelName, buyer, seller } = data

        const _m = m.map((m) => ({ ...m, createdAt: new Date(m.createdAt) }))
        setDiscussionData({ messages: _m, channelName, buyer, seller })
      } catch (e) {
        const { message } = getAxiosError(e)
        setToast({ message, error: true })
      }
    }

    getDiscussion()
  }, [discussionId, csrfToken, setToast])

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
        try {
          await axios.put('/api/discussions/' + discussionId, { csrfToken })
        } catch (e) {
          const { message } = getAxiosError(e)
          setToast({ message, error: true })
        }
      }
      updateUnseenMessages()
    }
  }, [session.id, setToast, csrfToken, discussionId, discussionData?.messages])

  useEffect(() => {
    const channelName = discussionData?.channelName

    if (!channelName) return

    const p = pusher.current
    const channel = p.subscribe('private-encrypted-' + channelName)

    const newMessageHandler = (msg: UnArray<JSONDiscussion['messages']>) => {
      const m = { ...msg, createdAt: new Date(msg.createdAt) }
      setDiscussionData((prev) =>
        prev ? { ...prev, messages: [...prev.messages, m] } : prev
      )
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

export default ChatMessageList
