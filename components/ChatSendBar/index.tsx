import Form from 'components/Form'
import PaperAirPlane from 'public/static/images/paper-airplane.svg'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import updateDiscussionSchema, {
  type UpdateDiscussionSchema,
} from 'schemas/updateDiscussionSchema'
import { useEffect } from 'react'
import { useToast } from 'contexts/toast'
import ajax from 'libs/ajax'
import type { DiscussionsIdPutError } from 'app/api/discussions/[id]/types'
import type { DiscussionPostError } from 'app/api/discussion/types'

interface WithDiscussionId {
  discussionId: string
  postId?: never
  postName?: never
  sellerId?: never
}

export interface WithoutDiscussionId {
  discussionId?: never
  postName: string
  postId: string
  sellerId: string
}

export type ChatSendBarProps = WithDiscussionId | WithoutDiscussionId

export default function ChatSendBar({
  discussionId,
  postId,
  postName,
  sellerId,
}: ChatSendBarProps) {
  const methods = useForm<UpdateDiscussionSchema>({
    resolver: joiResolver(updateDiscussionSchema),
  })

  const { setToast } = useToast()
  const { formState } = methods
  const { errors, isSubmitSuccessful } = formState

  const submitHandler: SubmitHandler<UpdateDiscussionSchema> = async (data) => {
    const response = !discussionId
      ? await ajax.post(
          '/discussion',
          { message: data.message, postId, sellerId, postName },
          { csrf: true }
        )
      : await ajax.put(
          '/discussions/' + discussionId,
          { message: data.message },
          { csrf: true }
        )

    if (!response.ok) {
      const { message }: DiscussionPostError | DiscussionsIdPutError =
        await response.json()

      setToast({ message, error: true })
    }
  }

  useEffect(() => {
    if (!errors.message) return
    setToast({ message: errors.message.message, error: true })
  }, [errors.message, setToast])

  useEffect(() => {
    if (!isSubmitSuccessful) return
    methods.reset({ message: '' })
  }, [methods, isSubmitSuccessful])

  return (
    <Form<UpdateDiscussionSchema>
      method="post"
      methods={methods}
      submitHandler={submitHandler}
      className="flex flex-row flex-nowrap m-8 md:m-16"
    >
      <textarea
        {...methods.register('message')}
        placeholder="Write your message"
        className="bg-fuchsia-200 placeholder:text-fuchsia-900/50	p-8 rounded-full w-full h-40 resize-none"
      ></textarea>
      <button
        type="submit"
        aria-label="Send"
        className="w-40 h-40 p-8 text-fuchsia-600 ml-8 hover:text-fuchsia-900 duration-200 transition-colors"
      >
        <PaperAirPlane className="w-24 h-24" />
      </button>
    </Form>
  )
}
