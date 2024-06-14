import type { DiscussionsIdDeleteError } from 'app/api/discussions/[id]/types'
import type { UserPutError } from 'app/api/user/types'
import type { UsersIdGetData, UsersIdGetError } from 'app/api/users/[id]/types'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import X from 'public/static/images/x.svg'

interface DeleteDiscussionButtonProps {
  discussionId: string
  userId?: string
}

export default function DeleteDiscussionButton({
  discussionId,
  userId,
}: DeleteDiscussionButtonProps) {
  const { setToast } = useToast()

  async function deleteDiscussion() {
    let response: Response | undefined = undefined

    if (userId) {
      response = await ajax.get('/users/' + userId)

      if (!response.ok) {
        const { message }: UsersIdGetError = await response.json()

        setToast({ message, error: true })

        return
      }

      const { discussions }: UsersIdGetData = await response.json()

      for (const { id, hidden } of discussions) {
        if (discussionId === id) {
          if (hidden) {
            response = await ajax.delete('/discussions/' + discussionId, {
              csrf: true,
            })
          } else {
            response = await ajax.put(
              '/user',
              { discussionId: discussionId },
              { csrf: true }
            )
          }
        }
      }
    } else {
      response = await ajax.delete('/discussions/' + discussionId, {
        csrf: true,
      })
    }

    if (!response.ok) {
      const { message }: DiscussionsIdDeleteError | UserPutError =
        await response.json()

      setToast({ message, error: true })

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
