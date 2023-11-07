'use client'

import { PostsIdDeleteError } from 'app/api/posts/[id]/types'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import { useRouter } from 'next/navigation'
import X from 'public/static/images/x.svg'

interface DeletePostButtonProps {
  postId: string
  isRound?: boolean
}

export default function DeletePostButton({
  postId,
  isRound,
}: DeletePostButtonProps) {
  const { setToast } = useToast()
  const router = useRouter()

  async function deletePost() {
    const response = await ajax.delete('/posts/' + postId, { csrf: true })

    if (!response.ok) {
      const { message }: PostsIdDeleteError = await response.json()

      setToast({ message, error: true })

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
      {isRound ? <X className="w-full h-full" /> : 'Delete'}
    </button>
  )
}
