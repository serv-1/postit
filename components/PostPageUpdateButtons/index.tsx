import DotButton from 'components/DotButton'
import Pencil from 'public/static/images/pencil.svg'
import X from 'public/static/images/x.svg'
import Link from 'next/link'
import { useToast } from 'contexts/toast'
import { useRouter } from 'next/navigation'
import Button from 'components/Button'
import ajax from 'libs/ajax'
import type { PostsIdDeleteError } from 'app/api/posts/[id]/types'
import formatToUrl from 'functions/formatToUrl'

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
    const response = await ajax.delete('/posts/' + id, { csrf: true })

    if (!response.ok) {
      const { message }: PostsIdDeleteError = await response.json()

      setToast({ message, error: true })

      return
    }

    router.push('/profile')
  }

  return (
    <>
      <Link
        href={`/posts/${id}/${formatToUrl(name)}/update`}
        className="mr-8 w-full"
      >
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
