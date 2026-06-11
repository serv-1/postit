import { useCallback, useEffect, useState } from 'react'
import type { Discussion as IDiscussion, User } from 'types'
import CommentDiscussionSvg from 'components/CommentDiscussionSvg'
import useEventListener from 'hooks/useEventListener'
import usePusher from 'hooks/usePusher'
import showToast from 'functions/showToast'
import fetchDiscussion from 'functions/fetchDiscussion'
import Modal from 'components/Modal'
import Discussion from 'components/Discussion'
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

  const [showBadge, setShowBadge] = useState(hasNewMessage)
  const [isHidden, setIsHidden] = useState(true)
  const [discussions, setDiscussions] = useState<IDiscussion[]>()
  const [openedDiscussionId, setOpenedDiscussionId] = useState<string | null>(
    null,
  )

  const getUserDiscussions = useCallback(async () => {
    const promises: Promise<IDiscussion>[] = []

    for (const { id, hidden } of signedInUser.discussions) {
      if (hidden) continue

      promises.push(fetchDiscussion(id))
    }

    return Promise.all(promises)
  }, [signedInUser.discussions])

  function open() {
    setIsHidden(false)
    setShowBadge(false)
  }

  function close() {
    setIsHidden(true)
  }

  useEventListener('document', 'openDiscussion', async (e) => {
    open()
    setOpenedDiscussionId(e.detail)
  })

  useEventListener('document', 'discussionDeleted', (e) => {
    setDiscussions((d) => d?.filter((d) => d._id !== e.detail))
  })

  usePusher<IDiscussion>(
    signedInUser.channelName,
    'discussion:new',
    async (discussion) => {
      if (discussions) {
        setDiscussions((d) => [...d!, discussion])
      } else {
        try {
          const userDiscussions = await getUserDiscussions()

          setDiscussions([...userDiscussions, discussion])
        } catch (e) {
          showToast({ message: (e as Error).message, error: true })
        }
      }

      if (isHidden) {
        setShowBadge(true)
      }
    },
  )

  usePusher(signedInUser.channelName, 'message:new', () => {
    if (isHidden) {
      setShowBadge(true)
    }
  })

  useEffect(() => {
    if (isHidden || discussions) return

    async function initDiscussions() {
      try {
        setDiscussions(await getUserDiscussions())
      } catch (e) {
        showToast({ message: (e as Error).message, error: true })
      }
    }

    initDiscussions()
  }, [isHidden, discussions, getUserDiscussions])

  useEffect(() => {
    if (
      !openedDiscussionId ||
      !discussions ||
      discussions.find((d) => d._id === openedDiscussionId)
    ) {
      return
    }

    async function addDiscussion() {
      try {
        const discussion = await fetchDiscussion(openedDiscussionId!)

        setDiscussions((d) => [...d!, discussion])
      } catch (e) {
        showToast({ message: (e as Error).message, error: true })
      }
    }

    addDiscussion()
  }, [openedDiscussionId, discussions])

  return (
    <>
      <button
        onClick={open}
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
        onClose={close}
        className="fixed top-0 left-0 w-screen h-screen z-1001 md:flex md:justify-center md:items-center md:bg-fuchsia-900/25"
      >
        <div className="bg-fuchsia-50 z-1001 flex flex-col h-full md:w-full md:max-w-450 md:max-h-800 md:rounded-2xl md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
          <button
            className="w-32 h-32 mt-16 mx-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
            aria-label="Close"
            onClick={close}
          >
            <XSvg className="w-full h-full" />
          </button>
          {discussions ? (
            discussions.length > 0 ? (
              <ul className="overflow-y-auto px-12 py-16 mx-4 scrollbar-thumb-fuchsia-200 scrollbar-track-transparent scrollbar-thin hover:scrollbar-thumb-fuchsia-300">
                {discussions.map((discussion) => (
                  <li className="mb-8 last:mb-0" key={discussion._id}>
                    <Discussion
                      discussion={discussion}
                      isModalOpen={discussion._id === openedDiscussionId}
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
