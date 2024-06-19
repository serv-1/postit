import type { PostsIdDeleteError } from 'app/api/posts/[id]/types'
import type { UserPutError } from 'app/api/user/types'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import X from 'public/static/images/x.svg'
import type { Post } from 'types'

interface ProfilePostDeleteButtonProps {
  postType: 'default' | 'favorite'
  postId: string
  postName: string
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
}

export default function ProfilePostDeleteButton({
  postType,
  postId,
  postName,
  setPosts,
}: ProfilePostDeleteButtonProps) {
  const { setToast } = useToast()

  async function deletePost() {
    let response: Response | null = null

    if (postType === 'favorite') {
      response = await ajax.put('/user', { favPostId: postId }, { csrf: true })
    } else {
      response = await ajax.delete('/posts/' + postId, { csrf: true })
    }

    if (!response.ok) {
      const { message }: UserPutError | PostsIdDeleteError =
        await response.json()

      setToast({ message, error: true })

      return
    }

    setToast({
      message:
        postType === 'favorite'
          ? 'The post has been removed from your favorite list.'
          : 'Your post has been successfully deleted.',
    })

    setPosts((posts) => posts.filter((post) => post.id !== postId))
  }

  return (
    <button
      className="sm-round-btn"
      aria-label={'Delete ' + postName}
      title={'Delete ' + postName}
      onClick={deletePost}
    >
      <X className="w-full h-full" />
    </button>
  )
}
