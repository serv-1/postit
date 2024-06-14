import Form from 'components/Form'
import PaperAirPlane from 'public/static/images/paper-airplane.svg'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import updateDiscussion, {
  type UpdateDiscussion,
} from 'schemas/updateDiscussion'
import { useEffect } from 'react'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import type { DiscussionsIdPutError } from 'app/api/discussions/[id]/types'
import type {
  DiscussionPostData,
  DiscussionPostError,
} from 'app/api/discussion/types'

export interface DiscussionSendBarProps {
  onMessageSent?: (id: string) => void
  discussionId?: string
  postId?: string
  postName?: string
  sellerId?: string
}

export default function DiscussionSendBar({
  onMessageSent,
  discussionId,
  postId,
  postName,
  sellerId,
}: DiscussionSendBarProps) {
  const methods = useForm<UpdateDiscussion>({
    resolver: joiResolver(updateDiscussion),
  })

  const { setToast } = useToast()
  const { formState, reset } = methods
  const { errors, isSubmitSuccessful } = formState

  const submitHandler: SubmitHandler<UpdateDiscussion> = async (data) => {
    let id = discussionId

    if (id) {
      const response = await ajax.put(
        '/discussions/' + id,
        { message: data.message },
        { csrf: true }
      )

      if (!response.ok) {
        const { message }: DiscussionsIdPutError = await response.json()

        setToast({ message, error: true })

        return
      }
    } else {
      const response = await ajax.post(
        '/discussion',
        { message: data.message, postId, sellerId, postName },
        { csrf: true }
      )

      if (!response.ok) {
        const { message }: DiscussionPostError = await response.json()

        setToast({ message, error: true })

        return
      }

      id = ((await response.json()) as DiscussionPostData).id
    }

    if (onMessageSent) {
      onMessageSent(id)
    }
  }

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful, reset])

  useEffect(() => {
    if (errors.message) {
      setToast({ message: errors.message.message, error: true })
    }
  }, [errors.message, setToast])

  return (
    <Form<UpdateDiscussion>
      method="post"
      methods={methods}
      submitHandler={submitHandler}
      className="flex flex-row flex-nowrap m-8 mt-auto md:mb-16 md:mx-16"
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
