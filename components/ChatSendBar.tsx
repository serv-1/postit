import Form from './Form'
import PaperAirPlane from 'public/static/images/paper-airplane.svg'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import updateDiscussionSchema, {
  UpdateDiscussionSchema,
} from 'schemas/updateDiscussionSchema'
import { useEffect } from 'react'
import { useToast } from 'contexts/toast'
import getAxiosError from 'utils/functions/getAxiosError'
import axios from 'axios'

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

export type ChatSendBarProps = (WithDiscussionId | WithoutDiscussionId) & {
  csrfToken?: string
}

const ChatSendBar = ({
  csrfToken,
  discussionId,
  postId,
  postName,
  sellerId,
}: ChatSendBarProps) => {
  const methods = useForm<UpdateDiscussionSchema>({
    resolver: joiResolver(updateDiscussionSchema),
  })

  const { setToast } = useToast()
  const { formState } = methods
  const { errors, isSubmitSuccessful } = formState

  const submitHandler: SubmitHandler<UpdateDiscussionSchema> = async (data) => {
    try {
      const message = data.message

      if (!discussionId) {
        const payload = { message, postId, sellerId, postName, csrfToken }
        await axios.post('/api/discussion', payload)
      } else {
        const url = '/api/discussions/' + discussionId
        await axios.put(url, { message, csrfToken })
      }
    } catch (e) {
      const { message } = getAxiosError(e)
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
      csrfToken={csrfToken}
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

export default ChatSendBar
