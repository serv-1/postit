import axios, { AxiosError } from 'axios'
import { getCsrfToken } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import DotButton from './DotButton'
import Heart from '../public/static/images/heart.svg'
import HeartFill from '../public/static/images/heart-fill.svg'

interface PostPageFavoriteButtonProps {
  postId: string
  favPostsIds?: string[]
}

const PostPageFavoriteButton = (props: PostPageFavoriteButtonProps) => {
  const { postId, favPostsIds } = props
  const { setToast } = useToast()
  const [isFavPost, setIsFavPost] = useState(false)

  useEffect(() => {
    if (!favPostsIds) return
    for (const favPostId of favPostsIds) {
      if (favPostId !== postId) continue
      setIsFavPost(true)
    }
  }, [postId, favPostsIds])

  const handleFavPost = favPostsIds
    ? async () => {
        try {
          const csrfToken = await getCsrfToken()
          await axios.put('/api/user', { csrfToken, favPostId: postId })

          setToast({
            message: `This post has been successfully ${
              isFavPost ? 'deleted from' : 'added to'
            } your favorite list! 🎉`,
          })
          setIsFavPost(!isFavPost)
        } catch (e) {
          const { message } = getAxiosError(e as AxiosError)
          setToast({ message, error: true })
        }
      }
    : () =>
        setToast({
          message: 'You need to be signed in to add it to your favorite list.',
        })

  const heartA11y = (isFavPost ? 'Delete from' : 'Add to') + ' favorite'

  const heartClass =
    'w-full h-full p-8 absolute top-0 left-0 transition-opacity duration-200 '

  const heartFillClass =
    heartClass +
    (isFavPost
      ? 'group-hover:opacity-0'
      : 'opacity-0 group-hover:opacity-100 group-hover:animate-[heartbeat_1s_linear_infinite]')

  return (
    <div className="absolute top-8 right-8 group">
      <DotButton
        noStates
        onClick={handleFavPost}
        title={heartA11y}
        aria-label={heartA11y}
      >
        <HeartFill data-testid="heartFill" className={heartFillClass} />
        <Heart data-testid="heart" className={heartClass} />
      </DotButton>
    </div>
  )
}

export default PostPageFavoriteButton
