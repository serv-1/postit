import ProfilePostDeleteButton from 'components/ProfilePostDeleteButton'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'
import formatToUrl from 'functions/formatToUrl'
import Image from 'next/image'
import Link from 'next/link'
import ChevronRight from 'public/static/images/chevron-right.svg'
import type { Post } from 'types'

interface ProfilePostProps {
  type: 'default' | 'favorite'
  id: string
  name: string
  image: string
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
}

export default function ProfilePost({
  type,
  id,
  name,
  image,
  setPosts,
}: ProfilePostProps) {
  return (
    <div className="relative md:max-w-[700px] md:mx-auto">
      <div className="absolute -top-4 -left-4 z-20">
        <ProfilePostDeleteButton
          postType={type}
          postId={id}
          postName={name}
          setPosts={setPosts}
        />
      </div>
      <Link
        href={`/posts/${id}/${formatToUrl(name)}`}
        className="flex flex-row flex-nowrap bg-fuchsia-200 rounded-8 hover:bg-fuchsia-300 transition-colors duration-200 group"
      >
        <div className="relative flex-shrink-0 w-[100px] h-[100px] md:w-[150px] md:h-[150px]">
          <Image
            src={NEXT_PUBLIC_AWS_URL + '/' + image}
            alt={name}
            fill
            className="rounded-l-8 object-cover"
          />
        </div>
        <div className="flex flex-row flex-nowrap min-w-0 w-full p-8 justify-between items-center text-fuchsia-600 md:p-16">
          <div className="font-bold truncate mr-8 md:mr-16">{name}</div>
          <div>
            <ChevronRight className="w-24 h-24 relative left-0 group-hover:left-8 transition-[left] duration-200" />
          </div>
        </div>
      </Link>
    </div>
  )
}
