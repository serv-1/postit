import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useToast } from 'contexts/toast'
import ChevronRight from 'public/static/images/chevron-right.svg'
import X from 'public/static/images/x.svg'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'
import type { UsersIdGetData, UsersIdGetError } from 'app/api/users/[id]/types'
import type { DiscussionsIdDeleteError } from 'app/api/discussions/[id]/types'

interface OpenHeaderChatModalButtonProps {
  onClick: () => void
  hasUnseenMessages: boolean
  interlocutor: { id?: string; name: string; image?: string }
  postName: string
  discussionId: string
}

export default function OpenHeaderChatModalButton({
  onClick,
  hasUnseenMessages,
  interlocutor,
  postName,
  discussionId,
}: OpenHeaderChatModalButtonProps) {
  const [isDeleted, setIsDeleted] = useState(false)

  const { setToast } = useToast()

  useEffect(() => {
    if (!isDeleted) return

    const deleteDiscussion = async () => {
      let response: Response | undefined = undefined

      if (!interlocutor.id) {
        response = await ajax.delete('/discussions/' + discussionId, {
          csrf: true,
        })
      } else {
        response = await ajax.get('/users/' + interlocutor.id)

        if (!response.ok) {
          const { message }: UsersIdGetError = await response.json()

          setToast({ message, error: true })

          return
        }

        const { discussionIds }: UsersIdGetData = await response.json()

        if (!discussionIds.includes(discussionId)) {
          response = await ajax.delete('/discussions/' + discussionId, {
            csrf: true,
          })
        }
      }

      if (!response.ok) {
        const { message }: DiscussionsIdDeleteError = await response.json()

        setToast({ message, error: true })

        return
      }

      response = await ajax.put('/user', { discussionId }, { csrf: true })

      if (!response.ok) {
        const { message }: UserPutError = await response.json()

        setToast({ message, error: true })
      }
    }

    deleteDiscussion()
  }, [isDeleted, interlocutor.id, setToast, discussionId])

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
        className="relative w-full flex flex-row flex-nowrap items-center gap-x-4 pr-4 bg-fuchsia-200 rounded-8 hover:bg-fuchsia-300 transition-colors duration-200 group overflow-hidden h-56"
        onClick={onClick}
        aria-label="Open discussion"
      >
        <Image
          src={
            interlocutor.image
              ? NEXT_PUBLIC_AWS_URL + '/' + interlocutor.image
              : NEXT_PUBLIC_DEFAULT_USER_IMAGE
          }
          alt={interlocutor.name + "'s profile picture"}
          width={64}
          height={64}
          className="rounded-r-full w-[52px] h-64 object-cover"
        />
        <div className="flex-grow text-left">
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
