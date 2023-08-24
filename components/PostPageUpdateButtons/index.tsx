import DotButton from 'components/DotButton'
import Pencil from 'public/static/images/pencil.svg'
import X from 'public/static/images/x.svg'
import Link from 'next/link'
import { useToast } from 'contexts/toast'
import getAxiosError from 'utils/functions/getAxiosError'
import axios, { AxiosError } from 'axios'
import { getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Button from 'components/Button'

interface PostPageUpdateButtonsProps {
  id: string
  name: string
  isDotButton?: boolean
}

export default function PostPageUpdateButtons({
  id,
  name,
  isDotButton,
}: PostPageUpdateButtonsProps) {
  const { setToast } = useToast()
  const router = useRouter()

  const deletePost = async () => {
    try {
      const csrfToken = await getCsrfToken()
      await axios.delete('/api/posts/' + id, { data: { csrfToken } })
      router.push('/profile')
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Link href={`/posts/${id}/${name}/update`} className="mr-8 w-full">
        {isDotButton ? (
          <DotButton aria-label="Edit">
            <Pencil className="w-full h-full" />
          </DotButton>
        ) : (
          <Button fullWidth color="primary">
            Edit
          </Button>
        )}
      </Link>
      {isDotButton ? (
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
