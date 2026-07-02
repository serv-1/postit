import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import Image from 'next/image'
import ChevronRightSvg from 'components/ChevronRightSvg'
import type { MouseEventHandler } from 'react'

interface OpenDiscussionButton {
  onClick: MouseEventHandler<HTMLButtonElement>
  postName: string
  interlocutor: { name: string; image?: string } | null
}

export default function OpenDiscussionModalButton({
  onClick,
  postName,
  interlocutor,
}: OpenDiscussionButton) {
  return (
    <button
      className="relative w-full flex flex-row flex-nowrap items-center gap-x-4 pr-4 bg-fuchsia-200 rounded-lg hover:bg-fuchsia-300 transition-colors duration-200 group overflow-hidden h-56"
      onClick={onClick}
      aria-label="Open discussion"
    >
      <Image
        src={
          interlocutor?.image
            ? NEXT_PUBLIC_AWS_URL + '/' + interlocutor.image
            : NEXT_PUBLIC_DEFAULT_USER_IMAGE
        }
        alt=""
        width={64}
        height={64}
        className="rounded-r-full w-52 h-64 object-cover"
      />
      <div className="grow text-left">
        {interlocutor ? (
          <span className="block text-fuchsia-600">{interlocutor.name}</span>
        ) : (
          <span className="block text-rose-600 line-through">deleted</span>
        )}
        <span className="block font-bold">{postName}</span>
      </div>
      <div className="w-20 h-20 text-fuchsia-600 relative left-0 group-hover:left-4 transition-[left] duration-200">
        <ChevronRightSvg className="w-full h-full" />
      </div>
    </button>
  )
}
