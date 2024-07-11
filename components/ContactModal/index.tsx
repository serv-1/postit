'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Discussion } from 'types'
import type { Session } from 'next-auth'
import ContactButton from 'components/ContactButton'
import useEventListener from 'hooks/useEventListener'
import usePusher from 'hooks/usePusher'
import DiscussionModal from 'components/DiscussionModal'

export interface ContactModalProps {
  discussionId?: string
  isDiscussionHidden?: boolean
  postId: string
  sellerId: string
  postName: string
}

export default function ContactModal({
  discussionId: discussionIdProp,
  isDiscussionHidden: isDiscussionHiddenProp,
  postId,
  postName,
  sellerId,
}: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [discussionId, setDiscussionId] = useState(discussionIdProp)
  const [isDiscussionHidden, setIsDiscussionHidden] = useState(
    isDiscussionHiddenProp
  )

  const { data: session } = useSession() as { data: Session }

  function openModal() {
    if (discussionId && !isDiscussionHidden) {
      document.dispatchEvent(
        new CustomEvent('openDiscussion', { detail: discussionId })
      )
    } else {
      setIsOpen(true)
    }
  }

  function closeModal() {
    setIsOpen(false)
  }

  function onMessageSent(id: string) {
    setDiscussionId(id)
    setIsDiscussionHidden(false)
    closeModal()
    document.dispatchEvent(new CustomEvent('openDiscussion', { detail: id }))
  }

  useEventListener(document, 'discussionDeleted', (e) => {
    if (discussionId === e.detail) {
      setIsDiscussionHidden(true)
    }
  })

  usePusher<Discussion>(session.channelName, 'discussion:new', (discussion) => {
    if (discussion._id === discussionId) {
      setIsDiscussionHidden(false)
    }
  })

  return (
    <>
      <ContactButton onClick={openModal} />
      {isOpen && (
        <DiscussionModal
          onMessageSent={onMessageSent}
          onClose={closeModal}
          postName={postName}
          postId={postId}
          sellerId={sellerId}
        />
      )}
    </>
  )
}
