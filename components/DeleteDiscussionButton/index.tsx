import type { UserPutError } from 'app/api/user/types'
import showToast from 'functions/showToast'
import ajax from 'libs/ajax'
import XSvg from 'components/XSvg'

interface DeleteDiscussionButtonProps {
  discussionId: string
}

export default function DeleteDiscussionButton({
  discussionId,
}: DeleteDiscussionButtonProps) {
  async function deleteDiscussion() {
    const response = await ajax.put('/user', { discussionId }, { csrf: true })

    if (!response.ok) {
      const { message }: UserPutError = await response.json()

      showToast({ message, error: true })

      return
    }

    document.dispatchEvent(
      new CustomEvent('discussionDeleted', { detail: discussionId }),
    )
  }

  return (
    <button
      className="absolute -top-2 -left-2 z-10 bg-fuchsia-50 text-fuchsia-600 rounded-full w-20 h-20 shadow-[0_2px_8px_rgba(112,26,117,.25)] hover:bg-fuchsia-900 hover:text-fuchsia-50 transition-colors duration-200"
      onClick={deleteDiscussion}
      aria-label="Remove discussion"
    >
      <XSvg className="w-full h-full" />
    </button>
  )
}
