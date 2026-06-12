'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Discussion } from 'types'
import type { Session } from 'next-auth'
import ContactButton from 'components/ContactButton'
import useEventListener from 'hooks/useEventListener'
import usePusher from 'hooks/usePusher'
import Modal from 'components/Modal'
import XSvg from 'components/XSvg'
import DiscussionSendBar from 'components/DiscussionSendBar'

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
    isDiscussionHiddenProp,
  )

  const { data: session } = useSession() as { data: Session }

  function open() {
    if (discussionId && !isDiscussionHidden) {
      document.dispatchEvent(
        new CustomEvent('openDiscussion', { detail: discussionId }),
      )
    } else {
      setIsOpen(true)
    }
  }

  function close() {
    setIsOpen(false)
  }

  function onMessageSent(id: string) {
    setDiscussionId(id)
    setIsDiscussionHidden(false)
    close()
    document.dispatchEvent(new CustomEvent('openDiscussion', { detail: id }))
  }

  useEventListener('document', 'discussionDeleted', (e) => {
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
      <ContactButton onClick={open} />
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
            <DiscussionSendBar
              onMessageSent={onMessageSent}
              sellerId={sellerId}
              postName={postName}
              postId={postId}
            />
          </div>
        </Modal>
      )}
    </>
  )
}
