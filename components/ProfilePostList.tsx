import Image from 'next/image'
import formatToUrl from '../utils/functions/formatToUrl'
import ChevronRight from '../public/static/images/chevron-right.svg'
import X from '../public/static/images/x.svg'
import Link from './Link'
import DotButton from './DotButton'
import getAxiosError from '../utils/functions/getAxiosError'
import axios, { AxiosError } from 'axios'
import { useToast } from '../contexts/toast'
import { getCsrfToken } from 'next-auth/react'
import { useState } from 'react'
import { LighterPost } from '../types/common'

interface ProfilePostListProps {
  isFavPost?: boolean
  posts: LighterPost[]
  altText: string
}

const ProfilePostList = (props: ProfilePostListProps) => {
  const [posts, setPosts] = useState(props.posts)
  const { setToast } = useToast()

  const deletePost = async (id: string) => {
    try {
      if (props.isFavPost) {
        await axios.put('http://localhost:3000/api/user', {
          csrfToken: await getCsrfToken(),
          favPostId: id,
        })
      } else {
        await axios.delete(`http://localhost:3000/api/posts/${id}`, {
          data: { csrfToken: await getCsrfToken() },
        })
      }

      setToast({ message: 'The post has been successfully deleted! 🎉' })
      setPosts(posts.filter((post) => post.id !== id))
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      setToast({ message, error: true })
    }
  }

  return posts.length > 0 ? (
    <>
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative md:max-w-[700px] md:mx-auto mb-8 last:mb-0 md:mb-16"
        >
          <div className="absolute -top-4 -left-4 z-20">
            <DotButton
              isSmall
              aria-label={'Delete ' + post.name}
              title={'Delete ' + post.name}
              onClick={() => deletePost(post.id)}
            >
              <X className="w-full h-full" />
            </DotButton>
          </div>
          <Link
            href={`/posts/${post.id}/${formatToUrl(post.name)}`}
            className="flex flex-row flex-nowrap bg-fuchsia-200 rounded-8 hover:bg-fuchsia-300 transition-colors duration-200 group"
          >
            <div className="relative flex-shrink-0 w-[100px] h-[100px] md:w-[150px] md:h-[150px]">
              <Image
                src={post.image}
                alt=""
                layout="fill"
                objectFit="cover"
                className="rounded-l-8"
              />
            </div>
            <div className="flex flex-row flex-nowrap w-full p-8 justify-between items-center text-fuchsia-600 md:p-16">
              <div className="font-bold">{post.name}</div>
              <div>
                <ChevronRight className="w-24 h-24 relative left-0 group-hover:left-8 transition-[left] duration-200" />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  ) : (
    <div className="text-center">{props.altText}</div>
  )
}

export default ProfilePostList
