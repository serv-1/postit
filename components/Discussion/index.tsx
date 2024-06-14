import { useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import useEventListener from 'hooks/useEventListener'
import DeleteDiscussionButton from 'components/DeleteDiscussionButton'
import usePusher from 'hooks/usePusher'
import DiscussionModal from 'components/DiscussionModal'
import OpenDiscussionButton from 'components/OpenDiscussionButton'
import type { UnArray, Discussion as IDiscussion } from 'types'

export interface DiscussionProps {
  discussion: IDiscussion
  isModalOpen: boolean
  setOpenedDiscussionId: React.Dispatch<React.SetStateAction<string | null>>
}

export default function Discussion({
  discussion: discussionProp,
  isModalOpen,
  setOpenedDiscussionId,
}: DiscussionProps) {
  const [discussion, setDiscussion] = useState(discussionProp)
  const [showBadge, setShowBadge] = useState(
    discussionProp.hasNewMessage && !isModalOpen
  )

  const { data: session } = useSession() as { data: Session }

  function openModal() {
    setOpenedDiscussionId(discussion.id)
    setShowBadge(false)
  }

  useEventListener(document, 'openDiscussion', (e) => {
    if (e.detail === discussion.id) {
      openModal()
    }
  })

  usePusher<UnArray<IDiscussion['messages']>>(
    discussion.channelName,
    'message:new',
    (message) => {
      if (message.userId !== session.id && !isModalOpen) {
        setShowBadge(true)
      }

      setDiscussion((discussion) => ({
        ...discussion,
        messages: [...discussion.messages, message],
      }))
    }
  )

  const interlocutor =
    session.id === discussion.buyer.id ? discussion.seller : discussion.buyer

  return (
    <>
      <div className="relative w-full">
        <DeleteDiscussionButton
          discussionId={discussion.id}
          userId={interlocutor.id}
        />
        {showBadge && (
          <div
            role="status"
            aria-label={interlocutor.name + ' has responded'}
            className="absolute -top-2 -right-2 z-10"
          >
            <div className="w-[12px] h-[12px] rounded-full bg-red-600">
              <div className="h-full rounded-full bg-inherit animate-ping"></div>
            </div>
          </div>
        )}
        <OpenDiscussionButton
          onClick={openModal}
          postName={discussion.postName}
          userName={interlocutor.name}
          userImage={interlocutor.image}
        />
      </div>
      {isModalOpen && (
        <DiscussionModal
          onClose={() => setOpenedDiscussionId(null)}
          discussion={discussion}
        />
      )}
    </>
  )
}
