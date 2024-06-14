'use client'

import useToast from 'hooks/useToast'
import { useSession } from 'next-auth/react'
import Chat from 'public/static/images/chat.svg'

interface ContactButtonProps {
  onClick?: () => void
}

export default function ContactButton({ onClick }: ContactButtonProps) {
  const { setToast } = useToast()
  const { status } = useSession()

  async function handleClick() {
    if (status !== 'authenticated') {
      setToast({
        message: 'You need to be signed in to discuss with the seller.',
      })

      return
    }

    if (onClick) onClick()
  }

  return (
    <button
      className="round-btn p-[10px] bg-fuchsia-600 text-fuchsia-50 fixed bottom-8 right-8 z-[1001] md:primary-btn md:w-full md:static md:h-auto md:shadow-none"
      aria-label="Contact"
      onClick={handleClick}
    >
      <Chat className="w-full h-full md:hidden" />
      <span className="hidden md:inline">Contact</span>
    </button>
  )
}
