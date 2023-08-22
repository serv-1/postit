import DotButton from './DotButton'
import Pencil from 'public/static/images/pencil.svg'
import X from 'public/static/images/x.svg'
import Link from './Link'
import { useToast } from 'contexts/toast'
import getAxiosError from 'utils/functions/getAxiosError'
import axios, { AxiosError } from 'axios'
import { getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/router'
import Button from './Button'

interface PostPageUpdateButtonsProps {
  id: string
  name: string
  isDotButton?: boolean
}

const PostPageUpdateButtons = (props: PostPageUpdateButtonsProps) => {
  const { setToast } = useToast()
  const router = useRouter()

  const deletePost = async () => {
    try {
      const csrfToken = await getCsrfToken()
      await axios.delete('/api/posts/' + props.id, { data: { csrfToken } })
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

export default PostPageUpdateButtons
