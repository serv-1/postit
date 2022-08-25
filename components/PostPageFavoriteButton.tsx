import axios, { AxiosError } from 'axios'
import { getCsrfToken } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import DotButton from './DotButton'
import Heart from '../public/static/images/heart.svg'
import HeartFill from '../public/static/images/heart-fill.svg'
import { IUser } from '../types/common'

interface PostPageFavoriteButtonProps {
  postId: string
  user?: IUser
}

const PostPageFavoriteButton = (props: PostPageFavoriteButtonProps) => {
  const { postId, user } = props
  const { setToast } = useToast()
  const [isFavPost, setIsFavPost] = useState(false)

  useEffect(() => {
    if (!user) return
    for (const favPost of user.favPosts) {
      if (favPost.id !== postId) continue
      setIsFavPost(true)
    }
  }, [postId, user])

  const handleFavPost = user
    ? async () => {
        try {
          await axios.put('http://localhost:3000/api/user', {
            csrfToken: await getCsrfToken(),
            favPostId: postId,
          })

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

  const hiddenOnHover =
    'w-full h-full transition-opacity duration-200 group-hover:opacity-0'
  const visibleOnHover =
    'w-full h-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 group-hover:animate-[heartbeat_1s_linear_infinite] relative -top-full'

  return (
    <div className="absolute top-8 right-8 group">
      <DotButton
        noStates
        onClick={handleFavPost}
        title={heartA11y}
        aria-label={heartA11y}
      >
        {isFavPost ? (
          <>
            <HeartFill data-testid="heartFill" className={hiddenOnHover} />
            <Heart data-testid="heart" className={visibleOnHover} />
          </>
        ) : (
          <>
            <Heart data-testid="heart" className={hiddenOnHover} />
            <HeartFill data-testid="heartFill" className={visibleOnHover} />
          </>
        )}
      </DotButton>
    </div>
  )
}

export default PostPageFavoriteButton
