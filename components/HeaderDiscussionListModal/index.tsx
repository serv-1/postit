import { useState } from 'react'
import type { Discussion, User } from 'types'
import CommentDiscussionSvg from 'components/CommentDiscussionSvg'
import useEventListener from 'hooks/useEventListener'
import usePusher from 'hooks/usePusher'
import showToast from 'functions/showToast'
import fetchDiscussion from 'functions/fetchDiscussion'
import Modal from 'components/Modal'
import DiscussionModal from 'components/DiscussionModal'
import LoadingSpinner from 'components/LoadingSpinner'
import XSvg from 'components/XSvg'

interface HeaderDiscussionListModalProps {
  signedInUser: User
}

export default function HeaderDiscussionListModal({
  signedInUser,
}: HeaderDiscussionListModalProps) {
  let hasNewMessage = false

  for (const discussion of signedInUser.discussions) {
    if (discussion.hasNewMessage) {
      hasNewMessage = true
      break
    }
  }

  const [shouldFetchDiscussions, setShouldFetchDiscussions] = useState(true)
  const [showBadge, setShowBadge] = useState(hasNewMessage)
  const [isHidden, setIsHidden] = useState(true)
  const [discussions, setDiscussions] = useState<Discussion[]>()
  const [openedDiscussionId, setOpenedDiscussionId] = useState<string | null>(
    null,
  )

  async function initDiscussions() {
    if (!shouldFetchDiscussions) return
    setShouldFetchDiscussions(false)

    try {
      const promises: Promise<Discussion>[] = []

      for (const { id, hidden } of signedInUser.discussions) {
        if (hidden) continue

        promises.push(fetchDiscussion(id))
      }

      const discussions = await Promise.all(promises)
      setDiscussions((d) => (d ? [...d, ...discussions] : discussions))

      return discussions
    } catch (e) {
      showToast({ message: (e as Error).message, error: true })
    }
  }

  async function handleOpen() {
    setIsHidden(false)
    setShowBadge(false)
    await initDiscussions()
  }

  function handleClose() {
    setIsHidden(true)
  }

  useEventListener('document', 'openDiscussion', async (e) => {
    setOpenedDiscussionId(e.detail)
    setIsHidden(false)
    setShowBadge(false)

    const _discussions = discussions ?? (await initDiscussions())
    if (!_discussions || _discussions.find((d) => d._id === e.detail)) return

    try {
      const discussion = await fetchDiscussion(e.detail)
      setDiscussions((d) => [...d!, discussion])
    } catch (e) {
      showToast({ message: (e as Error).message, error: true })
    }
  })

  useEventListener('document', 'discussionDeleted', (e) => {
    setDiscussions((d) => d?.filter((d) => d._id !== e.detail))
  })

  usePusher<Discussion>(
    signedInUser.channelName,
    'discussion:new',
    async (discussion) => {
      setDiscussions((d) => (d ? [...d, discussion] : [discussion]))
      setShowBadge(isHidden)
    },
  )

  usePusher(signedInUser.channelName, 'message:new', () => {
    setShowBadge(isHidden)
  })

  return (
    <>
      <button
        onClick={handleOpen}
        className={
          'relative w-40 h-40 align-bottom transition-colors duration-200 ' +
          (showBadge
            ? 'text-red-600 hover:text-red-900'
            : 'text-fuchsia-600 hover:text-fuchsia-900')
        }
        aria-label="Open discussion list"
      >
        {showBadge && (
          <div
            role="status"
            aria-label="You have a new message"
            className="w-full h-full absolute top-0 left-0 bg-red-100 rounded-full animate-ping"
          ></div>
        )}
        <CommentDiscussionSvg className="relative w-full h-full" />
      </button>
      <Modal
        isHidden={isHidden}
        onClose={handleClose}
        className="fixed top-0 left-0 w-screen h-screen z-1001 md:flex md:justify-center md:items-center md:bg-fuchsia-900/25"
      >
        <div className="bg-fuchsia-50 z-1001 flex flex-col h-full md:w-full md:max-w-450 md:max-h-800 md:rounded-2xl md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
          <button
            className="w-32 h-32 mt-16 mx-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
            aria-label="Close"
            onClick={handleClose}
          >
            <XSvg className="w-full h-full" />
          </button>
          {discussions ? (
            discussions.length > 0 ? (
              <ul className="overflow-y-auto px-12 py-16 mx-4 scrollbar-thumb-fuchsia-200 scrollbar-track-transparent scrollbar-thin hover:scrollbar-thumb-fuchsia-300">
                {discussions.map((discussion) => (
                  <li className="mb-8 last:mb-0" key={discussion._id}>
                    <DiscussionModal
                      discussion={discussion}
                      isHidden={discussion._id !== openedDiscussionId}
                      setOpenedDiscussionId={setOpenedDiscussionId}
                      signedInUser={signedInUser}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="w-full h-full relative p-16 flex flex-row justify-center items-center">
                <div className="w-full h-full max-w-328 max-h-328 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-fuchsia-100">
                  <CommentDiscussionSvg className="w-full h-full" />
                </div>
                <p className="z-10">Your discussions will be displayed here.</p>
              </div>
            )
          ) : (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
