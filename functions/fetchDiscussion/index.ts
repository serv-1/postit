import type {
  DiscussionsIdGetData,
  DiscussionsIdGetError,
} from 'app/api/discussions/[id]/types'
import ajax from 'libs/ajax'

export default async function fetchDiscussion(
  id: string
): Promise<DiscussionsIdGetData> {
  const response = await ajax.get('/discussions/' + id, { csrf: true })

  if (!response.ok) {
    const { message }: DiscussionsIdGetError = await response.json()

    throw new Error(message)
  }

  return response.json()
}
