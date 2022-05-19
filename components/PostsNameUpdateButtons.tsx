import DotButton from './DotButton'
import Pencil from '../public/static/images/pencil.svg'
import X from '../public/static/images/x.svg'
import Link from './Link'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import axios, { AxiosError } from 'axios'
import { getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/router'
import Button from './Button'

interface PostsNameUpdateButtonsProps {
  id: string
  name: string
  isDotButton?: boolean
}

const PostsNameUpdateButtons = (props: PostsNameUpdateButtonsProps) => {
  const { setToast } = useToast()
  const router = useRouter()

  const deletePost = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/posts/${props.id}`, {
        data: { csrfToken: await getCsrfToken() },
      })
      router.push('/profile')
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Link
        href={`/posts/${props.id}/${props.name}/update`}
        className="mr-8 w-full"
      >
        {props.isDotButton ? (
          <DotButton aria-label="Edit">
            <Pencil className="w-full h-full" />
          </DotButton>
        ) : (
          <Button fullWidth color="primary">
            Edit
          </Button>
        )}
      </Link>
      {props.isDotButton ? (
        <DotButton aria-label="Delete" onClick={deletePost}>
          <X className="w-full h-full" />
        </DotButton>
      ) : (
        <Button fullWidth color="danger" onClick={deletePost}>
          Delete
        </Button>
      )}
    </>
  )
}

export default PostsNameUpdateButtons
