import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import useEventListener from 'hooks/useEventListener'
import DeleteDiscussionButton from 'components/DeleteDiscussionButton'
import usePusher from 'hooks/usePusher'
import OpenDiscussionButton from 'components/OpenDiscussionButton'
import type { UnArray, Discussion as IDiscussion, User } from 'types'
import ajax from 'libs/ajax'
import type { UsersIdGetError } from 'app/api/users/[id]/types'
import showToast from 'functions/showToast'
import LoadingSpinner from 'components/LoadingSpinner'
import DiscussionBadge from 'components/DiscussionBadge'
import Modal from 'components/Modal'
import XSvg from 'components/XSvg'
import DiscussionMessageList from 'components/DiscussionMessageList'
import DiscussionSendBar from 'components/DiscussionSendBar'

export interface DiscussionModalProps {
  discussion: IDiscussion
  isOpen: boolean
  setOpenedDiscussionId: React.Dispatch<React.SetStateAction<string | null>>
  signedInUser: User
}

export default function DiscussionModal({
  discussion: propDiscussion,
  isOpen,
  setOpenedDiscussionId,
  signedInUser,
}: DiscussionModalProps) {
  const [discussion, setDiscussion] = useState({
    ...propDiscussion,
    hasNewMessage: isOpen ? false : propDiscussion.hasNewMessage,
  })
  const [interlocutor, setInterlocutor] = useState<User | null>()
  const { data: session } = useSession() as { data: Session }

  function open() {
    setOpenedDiscussionId(discussion._id)
    setDiscussion((d) => (d.hasNewMessage ? { ...d, hasNewMessage: false } : d))
  }

  function close() {
    setOpenedDiscussionId(null)
  }

  useEventListener('document', 'openDiscussion', (e) => {
    if (e.detail === discussion._id) {
      open()
    }
  })

  usePusher<UnArray<IDiscussion['messages']>>(
    discussion.channelName,
    'message:new',
    (message) => {
      setDiscussion((discussion) => ({
        ...discussion,
        hasNewMessage: message.userId !== session.id && !isOpen,
        messages: [...discussion.messages, message],
      }))
    },
  )

  usePusher(discussion.channelName, 'interlocutor:deleted', () => {
    setInterlocutor(null)
  })

  useEffect(() => {
    async function getInterlocutor() {
      let response: Response | null = null

      if (session.id === discussion.buyerId && discussion.sellerId) {
        response = await ajax.get('/users/' + discussion.sellerId)
      } else if (session.id === discussion.sellerId && discussion.buyerId) {
        response = await ajax.get('/users/' + discussion.buyerId)
      }

      if (response) {
        if (!response.ok) {
          const { message }: UsersIdGetError = await response.json()

          showToast({ message, error: true })
        } else {
          setInterlocutor((await response.json()) as User)
        }
      } else {
        setInterlocutor(null)
      }
    }

    getInterlocutor()
  }, [discussion.sellerId, discussion.buyerId, session.id])

  return interlocutor !== undefined ? (
    <>
      <div className="relative w-full">
        <DeleteDiscussionButton
          discussionId={discussion._id}
          interlocutorDiscussions={interlocutor?.discussions}
        />
        <DiscussionBadge isShown={discussion.hasNewMessage} />
        <OpenDiscussionButton
          onOpen={open}
          postName={discussion.postName}
          interlocutor={interlocutor}
          discussion={discussion}
          setDiscussion={setDiscussion}
        />
      </div>
      {isOpen && (
        <Modal
          className="fixed top-0 left-0 w-screen h-screen z-1001 md:flex md:justify-center md:items-center md:bg-fuchsia-900/25"
          onClose={close}
        >
          <div className="bg-fuchsia-50 z-1001 flex flex-col h-full md:w-full md:max-w-450 md:max-h-800 md:rounded-2xl md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
            <button
              className="w-32 h-32 m-8 md:m-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
              aria-label="Close"
              onClick={close}
            >
              <XSvg className="w-full h-full" />
            </button>
            <DiscussionMessageList
              signedInUser={signedInUser}
              interlocutor={interlocutor}
              messages={discussion.messages}
            />
            <DiscussionSendBar discussionId={discussion._id} />
          </div>
        </Modal>
      )}
    </>
  ) : (
    <div className="bg-fuchsia-200 rounded-lg h-56 flex justify-center items-center">
      <LoadingSpinner />
    </div>
  )
}
