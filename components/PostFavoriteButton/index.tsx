'use client'

import { useState } from 'react'
import Heart from 'public/static/images/heart.svg'
import HeartFill from 'public/static/images/heart-fill.svg'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'
import showToast from 'functions/showToast'
import { useSession } from 'next-auth/react'

interface PostFavoriteButtonProps {
  isActive?: boolean
  postId: string
}

export default function PostFavoriteButton(props: PostFavoriteButtonProps) {
  const [isActive, setIsActive] = useState(props.isActive)
  const { status } = useSession()

  const handleClick = async () => {
    if (status === 'unauthenticated') {
      showToast({ message: 'You need to be authenticated.' })

      return
    }

    const response = await ajax.put(
      '/user',
      { favPostId: props.postId },
      { csrf: true }
    )

    if (!response.ok) {
      const { message }: UserPutError = await response.json()

      showToast({ message, error: true })

      return
    }

    showToast({
      message: `This post has been successfully ${
        isActive ? 'deleted from' : 'added to'
      } your favorite list! 🎉`,
    })

    setIsActive(!isActive)
  }

  return (
    <button
      className="group absolute top-8 right-8 round-btn hover:bg-fuchsia-50 hover:text-fuchsia-600"
      onClick={handleClick}
      aria-label={(isActive ? 'Delete from' : 'Add to') + ' favorite list'}
    >
      <HeartFill className="w-full h-full absolute top-0 left-0 p-8 opacity-0 group-hover:opacity-100 group-hover:animate-[heartbeat_1s_linear_infinite] transition-opacity duration-200" />
      <Heart className="w-full h-full" />
    </button>
  )
}
