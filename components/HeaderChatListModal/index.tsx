import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from 'contexts/toast'
import CommentDiscussion from 'public/static/images/comment-discussion.svg'
import X from 'public/static/images/x.svg'
import type { DiscussionEventData } from 'types'
import Modal from 'components/Modal'
import HeaderChatModal from 'components/HeaderChatModal'
import getClientPusher from 'functions/getClientPusher'
import styles from 'styles/chatScrollbar.module.css'
import ajax from 'libs/ajax'
import type { UsersIdGetData, UsersIdGetError } from 'app/api/users/[id]/types'

export default function HeaderChatListModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [discussionIds, setDiscussionIds] = useState<string[]>([])
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false)

  const pusher = useRef(getClientPusher())
  const chatOpen = useRef(false)
  const { setToast } = useToast()
  const { data: session } = useSession() as { data: Session }

  useEffect(() => {
    async function getDiscussionsIds() {
      const response = await ajax.get('/users/' + session.id)

      if (!response.ok) {
        const { message }: UsersIdGetError = await response.json()

        setToast({ message, error: true })

        return
      }

      const user: UsersIdGetData = await response.json()

      setDiscussionIds(user.discussionIds)
      setHasUnseenMessages(user.hasUnseenMessages)
    }

    getDiscussionsIds()
  }, [setToast, session.id])

  useEffect(() => {
    const p = pusher.current
    const channel = p.subscribe('private-' + session.channelName)

    const newMessageHandler = () => {
      if (!chatOpen.current && !isOpen) setHasUnseenMessages(true)
    }
    const discussionCreatedHandler = (data: DiscussionEventData) => {
      setDiscussionIds((ids) => [...ids, data.discussionId])
      if (session.id !== data.userId) setHasUnseenMessages(true)
    }
    const discussionDeletedHandler = (discussionId: string) => {
      setDiscussionIds((ids) => ids.filter((id) => id !== discussionId))
    }

    channel.bind('new-message', newMessageHandler)
    channel.bind('discussion-created', discussionCreatedHandler)
    channel.bind('discussion-deleted', discussionDeletedHandler)

    const chatOpenHandler = () => (chatOpen.current = !chatOpen.current)
    document.addEventListener('chatOpen', chatOpenHandler)

    return () => {
      channel.unbind('new-message', newMessageHandler)
      channel.unbind('discussion-created', discussionCreatedHandler)
      channel.unbind('discussion-deleted', discussionDeletedHandler)
      document.removeEventListener('chatOpen', chatOpenHandler)
    }
  }, [isOpen, session.channelName, session.id])

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true)
          setHasUnseenMessages(false)
        }}
        className={
          'relative w-40 h-40 align-bottom transition-colors duration-200 ' +
          (hasUnseenMessages
            ? 'text-red-600 hover:text-red-900'
            : 'text-fuchsia-600 hover:text-fuchsia-900')
        }
        aria-label="Open discussion list"
      >
        {hasUnseenMessages && (
          <div
            role="status"
            aria-label="Someone has responded to you."
            className="w-full h-full absolute z-[-1] top-0 left-0 bg-red-100 rounded-full animate-ping"
          ></div>
        )}
        <CommentDiscussion className="w-full h-full" />
      </button>
      {isOpen && (
        <Modal
          setIsOpen={setIsOpen}
          className="fixed top-0 left-0 w-screen h-screen z-[1001] md:flex md:justify-center md:items-center md:bg-fuchsia-900/25"
        >
          <div className="bg-fuchsia-50 z-[1001] flex flex-col h-full md:w-full md:max-w-[450px] md:max-h-[800px] md:rounded-16 md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
            <button
              className="w-32 h-32 mt-16 mx-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-full h-full" />
            </button>
            {discussionIds.length === 0 ? (
              <div className="w-full h-full relative p-16 flex flex-row justify-center items-center">
                <div className="w-full h-full max-w-[328px] max-h-[328px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-fuchsia-100">
                  <CommentDiscussion className="w-full h-full" />
                </div>
                <p role="status" className="z-10">
                  Your discussions will be displayed here.
                </p>
              </div>
            ) : (
              <div
                className={
                  'overflow-y-auto px-[12px] py-16 mx-[4px] ' + styles.container
                }
              >
                {discussionIds.map((id) => (
                  <HeaderChatModal key={id} discussionId={id} />
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
