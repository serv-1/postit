import axios from 'axios'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useToast } from '../contexts/toast'
import ChevronRight from '../public/static/images/chevron-right.svg'
import X from '../public/static/images/x.svg'
import { IUser } from '../types/common'
import getAxiosError from '../utils/functions/getAxiosError'

interface OpenHeaderChatModalButtonProps {
  onClick: () => void
  hasUnseenMessages: boolean
  interlocutor: { id?: string; name: string; image: string }
  postName: string
  csrfToken?: string
  discussionId: string
}

const OpenHeaderChatModalButton = ({
  onClick,
  hasUnseenMessages,
  interlocutor,
  postName,
  csrfToken,
  discussionId,
}: OpenHeaderChatModalButtonProps) => {
  const [isDeleted, setIsDeleted] = useState(false)

  const { setToast } = useToast()

  useEffect(() => {
    if (!isDeleted) return

    const deleteDiscussion = async () => {
      try {
        let hasToDelete = false

        if (!interlocutor.id) {
          hasToDelete = true
        } else {
          const url = 'http://localhost:3000/api/users/' + interlocutor.id
          const { data } = await axios.get<IUser>(url)

          if (!data.discussionsIds.includes(discussionId)) {
            hasToDelete = true
          }
        }

        const url = 'http://localhost:3000/api/user/'
        await axios.put(url, { discussionId, csrfToken })

        if (hasToDelete) {
          const url = `http://localhost:3000/api/discussions/${discussionId}?csrfToken=${csrfToken}`
          await axios.delete(url)
        }
      } catch (e) {
        const { message } = getAxiosError(e)
        setToast({ message, error: true })
      }
    }

    deleteDiscussion()
  }, [isDeleted, interlocutor.id, setToast, discussionId, csrfToken])

  return !isDeleted ? (
    <div className="relative w-full">
      <button
        className="absolute -top-2 -left-2 z-10 bg-fuchsia-50 text-fuchsia-600 rounded-full w-[20px] h-[20px] shadow-[0_2px_8px_rgba(112,26,117,.25)] hover:bg-fuchsia-900 hover:text-fuchsia-50 transition-colors duration-200"
        onClick={() => setIsDeleted(true)}
        aria-label="Remove discussion"
      >
        <X className="w-full h-full" />
      </button>
      {hasUnseenMessages && (
        <div
          role="status"
          aria-label={interlocutor.name + ' has responded'}
          className="absolute -top-2 -right-2 z-10"
        >
          <div className="w-[12px] h-[12px] rounded-full bg-red-600">
            <div className="w-[12px] h-[12px] rounded-full bg-red-600 animate-ping"></div>
          </div>
        </div>
      )}
      <button
        className="relative w-full flex flex-row flex-nowrap items-center gap-x-4 p-4 bg-fuchsia-200 rounded-8 hover:bg-fuchsia-300 transition-colors duration-200 group overflow-hidden"
        onClick={onClick}
        aria-label="Open discussion"
      >
        <div className="absolute -top-4 -left-[12px] w-64 h-64">
          <Image
            src={interlocutor.image}
            alt={interlocutor.name + "'s profile picture"}
            objectFit="cover"
            width={64}
            height={64}
            className="rounded-full"
          />
        </div>
        <div className="flex-grow text-left ml-56">
          <span className="block text-fuchsia-600">{interlocutor.name}</span>
          <span className="block font-bold">{postName}</span>
        </div>
        <div className="w-[20px] h-[20px] text-fuchsia-600 relative left-0 group-hover:left-4 transition-[left] duration-200">
          <ChevronRight className="w-full h-full" />
        </div>
      </button>
    </div>
  ) : null
}

export default OpenHeaderChatModalButton
