'use client'

import { useState } from 'react'
import ChatFill from 'public/static/images/chat-fill.svg'
import { useSession } from 'next-auth/react'
import useToast from 'hooks/useToast'
import ChatModal from 'components/ChatModal'

interface ContactModalProps {
  discussionId?: string
  postId: string
  sellerId: string
  postName: string
  hasFloatingBtn?: boolean
}

export default function ContactModal({
  discussionId,
  postId,
  postName,
  sellerId,
  hasFloatingBtn,
}: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { setToast } = useToast()
  const { status } = useSession()

  function handleClick() {
    if (status === 'authenticated') {
      setIsOpen(true)
    } else {
      setToast({
        message: 'You need to be signed in to discuss with the seller.',
      })
    }
  }

  return (
    <>
      <button
        className={
          hasFloatingBtn
            ? 'round-btn bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-300 fixed bottom-8 right-8 z-[1001]'
            : 'primary-btn w-full'
        }
        aria-label="Contact"
        onClick={handleClick}
      >
        {hasFloatingBtn ? <ChatFill className="w-full h-full" /> : 'Contact'}
      </button>
      <ChatModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        discussionId={discussionId}
        postId={postId}
        postName={postName}
        sellerId={sellerId}
      />
    </>
  )
}
