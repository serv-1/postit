import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import Image from 'next/image'
import type { MouseEventHandler } from 'react'
import ChevronRight from 'public/static/images/chevron-right.svg'

interface OpenDiscussionButton {
  onClick: MouseEventHandler<HTMLButtonElement>
  postName: string
  userName: string
  userImage?: string
}

export default function OpenDiscussionButton({
  onClick,
  postName,
  userName,
  userImage,
}: OpenDiscussionButton) {
  return (
    <button
      className="relative w-full flex flex-row flex-nowrap items-center gap-x-4 pr-4 bg-fuchsia-200 rounded-8 hover:bg-fuchsia-300 transition-colors duration-200 group overflow-hidden h-56"
      onClick={onClick}
      aria-label="Open discussion"
    >
      <Image
        src={
          userImage
            ? NEXT_PUBLIC_AWS_URL + '/' + userImage
            : NEXT_PUBLIC_DEFAULT_USER_IMAGE
        }
        alt={userName + "'s profile picture"}
        width={64}
        height={64}
        className="rounded-r-full w-[52px] h-64 object-cover"
      />
      <div className="flex-grow text-left">
        <span className="block text-fuchsia-600">{userName}</span>
        <span className="block font-bold">{postName}</span>
      </div>
      <div className="w-[20px] h-[20px] text-fuchsia-600 relative left-0 group-hover:left-4 transition-[left] duration-200">
        <ChevronRight className="w-full h-full" />
      </div>
    </button>
  )
}
