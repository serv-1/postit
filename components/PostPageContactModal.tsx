import { useState } from 'react'
import { useToast } from '../contexts/toast'
import Button from './Button'
import ChatFill from '../public/static/images/chat-fill.svg'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'

interface PostPageContactModalProps {
  discussionId?: string
  postId: string
  sellerId: string
  postName: string
  csrfToken?: string
}

const ChatModal = dynamic(() => import('./ChatModal'), { ssr: false })

const PostPageContactModal = ({
  csrfToken,
  discussionId,
  postId,
  postName,
  sellerId,
}: PostPageContactModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const { setToast } = useToast()
  const { status } = useSession()

  const message = 'You need to be signed in to discuss with the seller.'
  const handleClick =
    status === 'authenticated'
      ? () => setIsOpen(true)
      : () => setToast({ message })

  return (
    <>
      <div className="md:hidden fixed bottom-8 right-8 z-[1001]">
        <button
          onClick={handleClick}
          aria-label="Contact"
          className="rounded-full transition-colors duration-200 bg-fuchsia-600 text-fuchsia-50 w-48 h-48 p-[12px] hover:text-fuchsia-300 hover:bg-fuchsia-900"
        >
          <ChatFill className="w-full h-full" />
        </button>
      </div>
      <div className="hidden md:block">
        <Button color="primary" onClick={handleClick} fullWidth>
          Contact
        </Button>
      </div>
      {status === 'authenticated' && (
        <ChatModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          csrfToken={csrfToken}
          {...(discussionId
            ? { discussionId }
            : { postId, postName, sellerId })}
        />
      )}
    </>
  )
}

export default PostPageContactModal
