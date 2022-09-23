import ChatSendBar, {
  ChatSendBarProps,
  WithoutDiscussionId,
} from './ChatSendBar'
import Modal from './Modal'
import X from '../public/static/images/x.svg'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import getClientPusher from '../utils/functions/getClientPusher'
import ChatMessageList from './ChatMessageList'
import { Session } from 'next-auth'
import { DiscussionEventData } from '../types/common'

export type ChatModalProps = ChatSendBarProps & {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatModal = ({
  isOpen,
  setIsOpen,
  csrfToken,
  postName,
  postId,
  sellerId,
  discussionId: id,
}: ChatModalProps) => {
  const [discussionId, setDiscussionId] = useState(id)

  const { data: session } = useSession() as { data: Session }
  const pusher = useRef(getClientPusher())

  useEffect(() => {
    const p = pusher.current
    const channel = p.subscribe('private-' + session.channelName)

    const discussionCreatedHandler = (d: DiscussionEventData) => setDiscussionId(d.discussionId) // prettier-ignore
    const discussionDeletedHandler = () => setDiscussionId(undefined)

    channel.bind('discussion-created', discussionCreatedHandler)
    channel.bind('discussion-deleted', discussionDeletedHandler)

    return () => {
      channel.unbind('discussion-created', discussionCreatedHandler)
      channel.unbind('discussion-deleted', discussionDeletedHandler)
    }
  }, [session.channelName])

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('chatOpen'))
  }, [isOpen])

  const chatSendBarProps = discussionId
    ? { discussionId }
    : ({ postId, postName, sellerId } as WithoutDiscussionId)

  return isOpen ? (
    <Modal
      className="fixed top-0 left-0 w-screen h-screen z-[1001] md:flex md:justify-center md:items-center md:bg-fuchsia-900/25"
      setIsOpen={setIsOpen}
    >
      <div className="bg-fuchsia-50 z-[1001] flex flex-col h-full md:w-full md:max-w-[450px] md:max-h-[800px] md:rounded-16 md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
        <button
          className="w-32 h-32 m-8 md:m-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
          aria-label="Close"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-full h-full" />
        </button>
        <ChatMessageList csrfToken={csrfToken} discussionId={discussionId} />
        <ChatSendBar csrfToken={csrfToken} {...chatSendBarProps} />
      </div>
    </Modal>
  ) : null
}

export default ChatModal
