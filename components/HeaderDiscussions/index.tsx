import DiscussionListModal from 'components/DiscussionListModal'
import { useCallback, useEffect, useState } from 'react'
import type { Discussion, User } from 'types'
import CommentDiscussion from 'public/static/images/comment-discussion.svg'
import useEventListener from 'hooks/useEventListener'
import usePusher from 'hooks/usePusher'
import showToast from 'functions/showToast'
import fetchDiscussion from 'functions/fetchDiscussion'

interface HeaderDiscussionsProps {
  signedInUser: User
}

export default function HeaderDiscussions({
  signedInUser,
}: HeaderDiscussionsProps) {
  let hasNewMessage = false

  for (const discussion of signedInUser.discussions) {
    if (discussion.hasNewMessage) {
      hasNewMessage = true
      break
    }
  }

  const [showBadge, setShowBadge] = useState(hasNewMessage)
  const [isModalHidden, setIsModalHidden] = useState(true)
  const [discussions, setDiscussions] = useState<Discussion[]>()
  const [openedDiscussionId, setOpenedDiscussionId] = useState<string | null>(
    null
  )

  const getUserDiscussions = useCallback(async () => {
    const promises: Promise<Discussion>[] = []

    for (const { id, hidden } of signedInUser.discussions) {
      if (hidden) continue

      promises.push(fetchDiscussion(id))
    }

    return Promise.all(promises)
  }, [signedInUser.discussions])

  function openModal() {
    setIsModalHidden(false)
    setShowBadge(false)
  }

  useEventListener('document', 'openDiscussion', async (e) => {
    openModal()
    setOpenedDiscussionId(e.detail)
  })

  useEventListener('document', 'discussionDeleted', (e) => {
    setDiscussions((d) => d?.filter((d) => d._id !== e.detail))
  })

  usePusher<Discussion>(
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

      if (isModalHidden) {
        setShowBadge(true)
      }
    }
  )

  usePusher(signedInUser.channelName, 'message:new', () => {
    if (isModalHidden) {
      setShowBadge(true)
    }
  })

  useEffect(() => {
    if (isModalHidden || discussions) return

    async function initDiscussions() {
      try {
        setDiscussions(await getUserDiscussions())
      } catch (e) {
        showToast({ message: (e as Error).message, error: true })
      }
    }

    initDiscussions()
  }, [isModalHidden, discussions, getUserDiscussions])

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
        onClick={openModal}
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
        <CommentDiscussion className="relative w-full h-full" />
      </button>
      <DiscussionListModal
        isHidden={isModalHidden}
        onClose={() => setIsModalHidden(true)}
        discussions={discussions}
        openedDiscussionId={openedDiscussionId}
        setOpenedDiscussionId={setOpenedDiscussionId}
        signedInUser={signedInUser}
      />
    </>
  )
}
