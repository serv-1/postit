import type { Discussion } from 'types'
import { useEffect, useRef, useState } from 'react'
import { useToast } from 'contexts/toast'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import getClientPusher from 'functions/getClientPusher'
import OpenHeaderChatModalButton from 'components/OpenHeaderChatModalButton'
import ChatModal from 'components/ChatModal'
import ajax from 'libs/ajax'
import type {
  DiscussionsIdGetData,
  DiscussionsIdGetError,
} from 'app/api/discussions/[id]/types'

interface DiscussionDataState {
  buyer: Discussion['buyer']
  seller: Discussion['seller']
  postName: string
  channelName: string
}

interface HeaderChatModalProps {
  discussionId: string
}

export default function HeaderChatModal({
  discussionId,
}: HeaderChatModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [discussionData, setDiscussionData] = useState<DiscussionDataState>()
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false)

  const { setToast } = useToast()
  const session = useSession() as { data: Session }
  const userId = session.data.id

  const pusher = useRef(getClientPusher())

  useEffect(() => {
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
      const lastMsg = discussion.messages[discussion.messages.length - 1]

      setHasUnseenMessages(userId !== lastMsg.userId && !lastMsg.seen)
      setDiscussionData({
        buyer: discussion.buyer,
        seller: discussion.seller,
        postName: discussion.postName,
        channelName: discussion.channelName,
      })
    }

    getDiscussion()
  }, [discussionId, setToast, userId])

  useEffect(() => {
    if (!discussionData?.channelName) return

    const newMessageHandler = () => {
      if (isOpen) return
      setHasUnseenMessages(true)
    }

    const p = pusher.current
    const channelName = 'private-encrypted-' + discussionData.channelName
    const channel = p.subscribe(channelName)

    channel.bind('new-message', newMessageHandler)

    return () => {
      channel.unbind('new-message', newMessageHandler)
    }
  }, [isOpen, discussionData?.channelName])

  if (!discussionData) return null

  const { buyer, seller, postName } = discussionData

  return (
    <div className="mb-8 last:mb-0">
      <OpenHeaderChatModalButton
        hasUnseenMessages={hasUnseenMessages}
        interlocutor={userId === buyer.id ? seller : buyer}
        postName={postName}
        discussionId={discussionId}
        onClick={() => {
          setIsOpen(true)
          setHasUnseenMessages(false)
        }}
      />
      <ChatModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        discussionId={discussionId}
      />
    </div>
  )
}
