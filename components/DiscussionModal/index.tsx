import { useEffect, useState } from 'react'
import useEventListener from 'hooks/useEventListener'
import DeleteDiscussionButton from 'components/DeleteDiscussionButton'
import usePusher from 'hooks/usePusher'
import OpenDiscussionModalButton from 'components/OpenDiscussionModalButton'
import type { UnArray, Discussion, User } from 'types'
import ajax from 'libs/ajax'
import type { UsersIdGetError } from 'app/api/users/[id]/types'
import showToast from 'functions/showToast'
import LoadingSpinner from 'components/LoadingSpinner'
import DiscussionBadge from 'components/DiscussionBadge'
import Modal from 'components/Modal'
import XSvg from 'components/XSvg'
import DiscussionMessageList from 'components/DiscussionMessageList'
import DiscussionSendBar from 'components/DiscussionSendBar'
import type { DiscussionsIdGetError } from 'app/api/discussions/[id]/types'

export interface DiscussionModalProps {
  discussion: Discussion
  isHidden: boolean
  setOpenedDiscussionId: React.Dispatch<React.SetStateAction<string | null>>
  signedInUser: User
}

export default function DiscussionModal({
  discussion,
  isHidden: propIsHidden,
  setOpenedDiscussionId,
  signedInUser,
}: DiscussionModalProps) {
  const [isHidden, setIsHidden] = useState(propIsHidden)
  const lastMessage = discussion.messages.at(-1)!
  const [hasNewMessage, setHasNewMessage] = useState(
    isHidden && signedInUser._id !== lastMessage.userId && !lastMessage.seen,
  )
  const [interlocutor, setInterlocutor] = useState<User | null>()

  async function handleOpen() {
    setOpenedDiscussionId(discussion._id)
    setIsHidden(false)
    setHasNewMessage(false)

    if (hasNewMessage) {
      const response = await ajax.put('/discussions/' + discussion._id, null, {
        csrf: true,
      })

      if (!response.ok) {
        const { message }: DiscussionsIdGetError = await response.json()

        showToast({ message, error: true })
      }
    }
  }

  function handleClose() {
    setOpenedDiscussionId(null)
    setIsHidden(true)
  }

  useEventListener('document', 'openDiscussion', async (e) => {
    if (e.detail === discussion._id) {
      await handleOpen()
    }
  })

  usePusher<UnArray<Discussion['messages']>>(
    discussion.channelName,
    'message:new',
    (message) => {
      setHasNewMessage(isHidden && message.userId !== signedInUser._id)
    },
  )

  usePusher(discussion.channelName, 'interlocutor:deleted', () => {
    setInterlocutor(null)
  })

  useEffect(() => {
    async function getInterlocutor() {
      if (discussion.buyerId && discussion.sellerId) {
        const response = await ajax.get(
          '/users/' +
            (signedInUser._id === discussion.buyerId
              ? discussion.sellerId
              : discussion.buyerId),
        )

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
  }, [discussion.sellerId, discussion.buyerId, signedInUser._id])

  return interlocutor !== undefined ? (
    <>
      <div className="relative w-full">
        <DeleteDiscussionButton
          discussionId={discussion._id}
          interlocutorDiscussions={interlocutor?.discussions}
        />
        <DiscussionBadge isShown={hasNewMessage} />
        <OpenDiscussionModalButton
          onClick={handleOpen}
          postName={discussion.postName}
          interlocutor={
            interlocutor && {
              name: interlocutor.name,
              image: interlocutor.image,
            }
          }
        />
      </div>
      <Modal
        isHidden={isHidden}
        className="fixed top-0 left-0 w-screen h-screen z-1001 md:flex md:justify-center md:items-center md:bg-fuchsia-900/25"
        onClose={handleClose}
      >
        <div className="bg-fuchsia-50 z-1001 flex flex-col h-full md:w-full md:max-w-450 md:max-h-800 md:rounded-2xl md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
          <button
            className="w-32 h-32 m-8 md:m-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
            aria-label="Close"
            onClick={handleClose}
          >
            <XSvg className="w-full h-full" />
          </button>
          <DiscussionMessageList
            signedInUser={signedInUser}
            interlocutor={interlocutor}
            messages={discussion.messages}
            discussionChannelName={discussion.channelName}
          />
          <DiscussionSendBar discussionId={discussion._id} />
        </div>
      </Modal>
    </>
  ) : (
    <div className="bg-fuchsia-200 rounded-lg h-56 flex justify-center items-center">
      <LoadingSpinner />
    </div>
  )
}
