import DiscussionListModal from 'components/DiscussionListModal'
import { useCallback, useEffect, useState } from 'react'
import type { Discussion, User } from 'types'
import CommentDiscussion from 'public/static/images/comment-discussion.svg'
import useEventListener from 'hooks/useEventListener'
import usePusher from 'hooks/usePusher'
import useToast from 'hooks/useToast'
import fetchDiscussion from 'functions/fetchDiscussion'

interface HeaderDiscussionsProps {
  user: User
}

export default function HeaderDiscussions({ user }: HeaderDiscussionsProps) {
  let hasNewMessage = false

  for (const discussion of user.discussions) {
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

  const { setToast } = useToast()

  const getUserDiscussions = useCallback(async () => {
    const promises: Promise<Discussion>[] = []

    for (const { id, hidden } of user.discussions) {
      if (hidden) continue

      promises.push(fetchDiscussion(id))
    }

    return Promise.all(promises)
  }, [user.discussions])

  function openModal() {
    setIsModalHidden(false)
    setShowBadge(false)
  }

  useEventListener(document, 'openDiscussion', async (e) => {
    openModal()
    setOpenedDiscussionId(e.detail)
  })

  useEventListener(document, 'discussionDeleted', (e) => {
    setDiscussions((d) => d?.filter((d) => d.id !== e.detail))
  })

  usePusher<Discussion>(
    user.channelName,
    'discussion:new',
    async (discussion) => {
      if (discussions) {
        setDiscussions((d) => [...d!, discussion])
      } else {
        try {
          const userDiscussions = await getUserDiscussions()

          setDiscussions([...userDiscussions, discussion])
        } catch (e) {
          setToast({ message: (e as Error).message, error: true })
        }
      }

      if (isModalHidden) {
        setShowBadge(true)
      }
    }
  )

  usePusher(user.channelName, 'message:new', () => {
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
        setToast({ message: (e as Error).message, error: true })
      }
    }

    initDiscussions()
  }, [isModalHidden, discussions, getUserDiscussions, setToast])

  useEffect(() => {
    if (
      !openedDiscussionId ||
      !discussions ||
      discussions.find((d) => d.id === openedDiscussionId)
    ) {
      return
    }

    async function addDiscussion() {
      try {
        const discussion = await fetchDiscussion(openedDiscussionId!)

        setDiscussions((d) => [...d!, discussion])
      } catch (e) {
        setToast({ message: (e as Error).message, error: true })
      }
    }

    addDiscussion()
  }, [openedDiscussionId, discussions, setToast])

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
            aria-label="Someone has responded to you."
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
      />
    </>
  )
}
