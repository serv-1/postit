import type { PostsIdDeleteError } from 'app/api/posts/[id]/types'
import type { UserPutError } from 'app/api/user/types'
import showToast from 'functions/showToast'
import ajax from 'libs/ajax'
import XSvg from 'components/XSvg'
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

      showToast({ message, error: true })

      return
    }

    showToast({
      message:
        postType === 'favorite'
          ? 'The post has been removed from your favorite list.'
          : 'Your post has been successfully deleted.',
    })

    setPosts((posts) => posts.filter((post) => post._id !== postId))
  }

  return (
    <button
      className="btn-round-sm"
      aria-label={'Delete ' + postName}
      title={'Delete ' + postName}
      onClick={deletePost}
    >
      <XSvg className="w-full h-full" />
    </button>
  )
}
