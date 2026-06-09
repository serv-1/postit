import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import useEventListener from 'hooks/useEventListener'
import DeleteDiscussionButton from 'components/DeleteDiscussionButton'
import usePusher from 'hooks/usePusher'
import DiscussionModal from 'components/DiscussionModal'
import OpenDiscussionButton from 'components/OpenDiscussionButton'
import type { UnArray, Discussion as IDiscussion, User } from 'types'
import ajax from 'libs/ajax'
import type { UsersIdGetError } from 'app/api/users/[id]/types'
import showToast from 'functions/showToast'
import LoadingSpinner from 'components/LoadingSpinner'
import DiscussionBadge from 'components/DiscussionBadge'

export interface DiscussionProps {
  discussion: IDiscussion
  isModalOpen: boolean
  setOpenedDiscussionId: React.Dispatch<React.SetStateAction<string | null>>
  signedInUser: User
}

export default function Discussion({
  discussion: propDiscussion,
  isModalOpen,
  setOpenedDiscussionId,
  signedInUser,
}: DiscussionProps) {
  const [discussion, setDiscussion] = useState({
    ...propDiscussion,
    hasNewMessage: isModalOpen ? false : propDiscussion.hasNewMessage,
  })
  const [interlocutor, setInterlocutor] = useState<User | null>()
  const { data: session } = useSession() as { data: Session }

  function openModal() {
    setOpenedDiscussionId(discussion._id)
    setDiscussion((d) => (d.hasNewMessage ? { ...d, hasNewMessage: false } : d))
  }

  useEventListener('document', 'openDiscussion', (e) => {
    if (e.detail === discussion._id) {
      openModal()
    }
  })

  usePusher<UnArray<IDiscussion['messages']>>(
    discussion.channelName,
    'message:new',
    (message) => {
      setDiscussion((discussion) => ({
        ...discussion,
        hasNewMessage: message.userId !== session.id && !isModalOpen,
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
          onOpen={openModal}
          postName={discussion.postName}
          interlocutor={interlocutor}
          discussion={discussion}
          setDiscussion={setDiscussion}
        />
      </div>
      {isModalOpen && (
        <DiscussionModal
          onClose={() => setOpenedDiscussionId(null)}
          discussionId={discussion._id}
          signedInUser={signedInUser}
          interlocutor={interlocutor}
          messages={discussion.messages}
        />
      )}
    </>
  ) : (
    <div className="bg-fuchsia-200 rounded-lg h-56 flex justify-center items-center">
      <LoadingSpinner />
    </div>
  )
}
