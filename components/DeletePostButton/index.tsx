'use client'

import type { PostsIdDeleteError } from 'app/api/posts/[id]/types'
import showToast from 'functions/showToast'
import ajax from 'libs/ajax'
import { useRouter } from 'next/navigation'
import XSvg from 'components/XSvg'

interface DeletePostButtonProps {
  postId: string
  isRound?: boolean
}

export default function DeletePostButton({
  postId,
  isRound,
}: DeletePostButtonProps) {
  const router = useRouter()

  async function deletePost() {
    const response = await ajax.delete('/posts/' + postId, { csrf: true })

    if (!response.ok) {
      const { message }: PostsIdDeleteError = await response.json()

      showToast({ message, error: true })

      return
    }

    router.push('/profile')
  }

  return (
    <button
      className={isRound ? 'round-btn' : 'danger-btn w-full'}
      onClick={deletePost}
      aria-label="Delete"
    >
      {isRound ? <XSvg className="w-full h-full" /> : 'Delete'}
    </button>
  )
}
