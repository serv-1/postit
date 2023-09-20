import { useEffect, useState } from 'react'
import { useToast } from 'contexts/toast'
import DotButton from 'components/DotButton'
import Heart from 'public/static/images/heart.svg'
import HeartFill from 'public/static/images/heart-fill.svg'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'

interface PostPageFavoriteButtonProps {
  postId: string
  favPostIds?: string[]
}

export default function PostPageFavoriteButton({
  postId,
  favPostIds,
}: PostPageFavoriteButtonProps) {
  const { setToast } = useToast()
  const [isFavPost, setIsFavPost] = useState(false)

  useEffect(() => {
    if (!favPostIds) return

    for (const favPostId of favPostIds) {
      if (favPostId !== postId) continue
      setIsFavPost(true)
    }
  }, [postId, favPostIds])

  const handleFavPost = favPostIds
    ? async () => {
        const response = await ajax.put(
          '/user',
          { favPostId: postId },
          { csrf: true }
        )

        if (!response.ok) {
          const { message }: UserPutError = await response.json()

          setToast({ message, error: true })

          return
        }

        setToast({
          message:
            'This post has been successfully ' +
            (isFavPost ? 'deleted from' : 'added to') +
            ' your favorite list! 🎉',
        })

        setIsFavPost(!isFavPost)
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
