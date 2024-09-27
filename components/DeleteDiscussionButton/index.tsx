import type { DiscussionsIdDeleteError } from 'app/api/discussions/[id]/types'
import type { UserPutError } from 'app/api/user/types'
import showToast from 'functions/showToast'
import ajax from 'libs/ajax'
import X from 'public/static/images/x.svg'
import type { User } from 'types'

interface DeleteDiscussionButtonProps {
  discussionId: string
  interlocutorDiscussions?: User['discussions']
}

export default function DeleteDiscussionButton({
  discussionId,
  interlocutorDiscussions,
}: DeleteDiscussionButtonProps) {
  async function deleteDiscussion() {
    let response: Response | null = null

    if (interlocutorDiscussions) {
      for (const { id, hidden } of interlocutorDiscussions) {
        if (discussionId === id) {
          response = hidden
            ? await ajax.delete('/discussions/' + discussionId, { csrf: true })
            : await ajax.put(
                '/user',
                { discussionId: discussionId },
                { csrf: true }
              )

          break
        }
      }
    } else {
      response = await ajax.delete('/discussions/' + discussionId, {
        csrf: true,
      })
    }

    if (!response!.ok) {
      const { message }: DiscussionsIdDeleteError | UserPutError =
        await response!.json()

      showToast({ message, error: true })

      return
    }

    document.dispatchEvent(
      new CustomEvent('discussionDeleted', { detail: discussionId })
    )
  }

  return (
    <button
      className="absolute -top-2 -left-2 z-10 bg-fuchsia-50 text-fuchsia-600 rounded-full w-[20px] h-[20px] shadow-[0_2px_8px_rgba(112,26,117,.25)] hover:bg-fuchsia-900 hover:text-fuchsia-50 transition-colors duration-200"
      onClick={deleteDiscussion}
      aria-label="Remove discussion"
    >
      <X className="w-full h-full" />
    </button>
  )
}
