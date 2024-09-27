import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import Image from 'next/image'
import ChevronRight from 'public/static/images/chevron-right.svg'
import type { Discussion, User } from 'types'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import showToast from 'functions/showToast'
import ajax from 'libs/ajax'
import type { DiscussionsIdGetError } from 'app/api/discussions/[id]/types'

interface OpenDiscussionButton {
  onOpen: () => void
  postName: string
  discussion: Discussion
  interlocutor: User | null
  setDiscussion: React.Dispatch<React.SetStateAction<Discussion>>
}

export default function OpenDiscussionButton({
  onOpen,
  postName,
  discussion,
  interlocutor,
  setDiscussion,
}: OpenDiscussionButton) {
  const { data: session } = useSession() as { data: Session }

  async function openModal() {
    onOpen()

    const lastMessage = discussion.messages[discussion.messages.length - 1]

    if (session.id !== lastMessage.userId && !lastMessage.seen) {
      const updateUnseenMessages = async () => {
        const response = await ajax.put(
          '/discussions/' + discussion._id,
          null,
          { csrf: true }
        )

        if (!response.ok) {
          const { message }: DiscussionsIdGetError = await response.json()

          showToast({ message, error: true })

          return
        }

        setDiscussion((discussion) => {
          const messages = [...discussion.messages]

          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            seen: true,
          }

          return { ...discussion, messages }
        })
      }

      updateUnseenMessages()
    }
  }

  return (
    <button
      className="relative w-full flex flex-row flex-nowrap items-center gap-x-4 pr-4 bg-fuchsia-200 rounded-8 hover:bg-fuchsia-300 transition-colors duration-200 group overflow-hidden h-56"
      onClick={openModal}
      aria-label="Open discussion"
    >
      <Image
        src={
          interlocutor?.image
            ? NEXT_PUBLIC_AWS_URL + '/' + interlocutor.image
            : NEXT_PUBLIC_DEFAULT_USER_IMAGE
        }
        alt={
          interlocutor
            ? interlocutor.name + "'s profile picture"
            : 'Default profile picture'
        }
        width={64}
        height={64}
        className="rounded-r-full w-[52px] h-64 object-cover"
      />
      <div className="flex-grow text-left">
        {interlocutor ? (
          <span className="block text-fuchsia-600">{interlocutor.name}</span>
        ) : (
          <span className="block text-rose-600 line-through">deleted</span>
        )}
        <span className="block font-bold">{postName}</span>
      </div>
      <div className="w-[20px] h-[20px] text-fuchsia-600 relative left-0 group-hover:left-4 transition-[left] duration-200">
        <ChevronRight className="w-full h-full" />
      </div>
    </button>
  )
}
