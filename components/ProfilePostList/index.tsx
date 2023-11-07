import Image from 'next/image'
import formatToUrl from 'functions/formatToUrl'
import ChevronRight from 'public/static/images/chevron-right.svg'
import X from 'public/static/images/x.svg'
import Link from 'next/link'
import useToast from 'hooks/useToast'
import { useState } from 'react'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'
import ajax from 'libs/ajax'
import type { UserPutError } from 'app/api/user/types'
import type { PostsIdDeleteError } from 'app/api/posts/[id]/types'

interface ProfilePostListProps {
  isFavPost?: boolean
  posts: { id: string; name: string; image: string }[]
  altText: string
}

export default function ProfilePostList({
  isFavPost,
  posts: _posts,
  altText,
}: ProfilePostListProps) {
  const [posts, setPosts] = useState(_posts)
  const { setToast } = useToast()

  const deletePost = async (id: string) => {
    let response: Response | null = null

    if (isFavPost) {
      response = await ajax.put('/user', { favPostId: id }, { csrf: true })
    } else {
      response = await ajax.delete('/posts/' + id, { csrf: true })
    }

    if (!response.ok) {
      const { message }: UserPutError | PostsIdDeleteError =
        await response.json()

      setToast({ message, error: true })

      return
    }

    setToast({ message: 'The post has been successfully deleted! 🎉' })
    setPosts(posts.filter((post) => post.id !== id))
  }

  return posts.length > 0 ? (
    <>
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative md:max-w-[700px] md:mx-auto mb-8 last:mb-0 md:mb-16"
        >
          <div className="absolute -top-4 -left-4 z-20">
            <button
              className="sm-round-btn"
              aria-label={'Delete ' + post.name}
              title={'Delete ' + post.name}
              onClick={() => deletePost(post.id)}
            >
              <X className="w-full h-full" />
            </button>
          </div>
          <Link
            href={`/posts/${post.id}/${formatToUrl(post.name)}`}
            className="flex flex-row flex-nowrap bg-fuchsia-200 rounded-8 hover:bg-fuchsia-300 transition-colors duration-200 group"
          >
            <div className="relative flex-shrink-0 w-[100px] h-[100px] md:w-[150px] md:h-[150px]">
              <Image
                src={NEXT_PUBLIC_AWS_URL + '/' + post.image}
                alt={post.name}
                fill
                className="rounded-l-8 object-cover"
              />
            </div>
            <div className="flex flex-row flex-nowrap min-w-0 w-full p-8 justify-between items-center text-fuchsia-600 md:p-16">
              <div className="font-bold truncate mr-8 md:mr-16">
                {post.name}
              </div>
              <div>
                <ChevronRight className="w-24 h-24 relative left-0 group-hover:left-8 transition-[left] duration-200" />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  ) : (
    <div className="text-center">{altText}</div>
  )
}
