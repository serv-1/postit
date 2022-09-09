import { Discussion, JSONDiscussion } from '../types/common'
import { useEffect, useRef, useState } from 'react'
import getAxiosError from '../utils/functions/getAxiosError'
import { useToast } from '../contexts/toast'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import getClientPusher from '../utils/functions/getClientPusher'
import OpenHeaderChatModalButton from './OpenHeaderChatModalButton'
import ChatModal from './ChatModal'

interface DiscussionDataState {
  buyer: Discussion['buyer']
  seller: Discussion['seller']
  postName: string
  channelName: string
}

interface HeaderChatModalProps {
  csrfToken?: string
  discussionId: string
}

const HeaderChatModal = ({ csrfToken, discussionId }: HeaderChatModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [discussionData, setDiscussionData] = useState<DiscussionDataState>()
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false)

  const { setToast } = useToast()
  const { data } = useSession() as { data: Session }
  const userId = data.id

  const pusher = useRef(getClientPusher())

  useEffect(() => {
    const getDiscussion = async () => {
      try {
        const url = `http://localhost:3000/api/discussions/${discussionId}?csrfToken=${csrfToken}`
        const { data } = await axios.get<JSONDiscussion>(url)

        const { messages, channelName, buyer, seller, postName } = data
        const lastMsg = messages[messages.length - 1]

        setDiscussionData({ buyer, seller, postName, channelName })
        setHasUnseenMessages(userId !== lastMsg.userId && !lastMsg.seen)
      } catch (e) {
        const { message } = getAxiosError(e)
        setToast({ message, error: true })
      }
    }
    getDiscussion()
  }, [csrfToken, discussionId, setToast, userId])

  useEffect(() => {
    if (!discussionData?.channelName) return

    const newMessageHandler = () => setHasUnseenMessages(true)

    const p = pusher.current
    const channel = p.subscribe(discussionData.channelName)

    channel.bind('new-message', newMessageHandler)

    return () => {
      channel.unbind('new-message', newMessageHandler)
    }
  }, [discussionData?.channelName])

  if (!discussionData) return null

  const { buyer, seller, postName } = discussionData

  return (
    <div className="px-16 mb-8 last:mb-0">
      <OpenHeaderChatModalButton
        hasUnseenMessages={hasUnseenMessages}
        interlocutor={userId === buyer.id ? seller : buyer}
        postName={postName}
        csrfToken={csrfToken}
        discussionId={discussionId}
        onClick={() => {
          setIsOpen(true)
          setHasUnseenMessages(false)
        }}
      />
      <ChatModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        csrfToken={csrfToken}
        discussionId={discussionId}
      />
    </div>
  )
}

export default HeaderChatModal
