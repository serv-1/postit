import Image from 'next/image'
import addCommasToNb from '../utils/functions/addCommasToNb'
import Link from './Link'

export interface PostProps {
  id: string
  name: string
  price: number
  image: string
}

const Post = ({ id, name, price, image }: PostProps) => {
  const truncatedName = name.length > 23 ? name.slice(0, 22) + '...' : name
  const allowedChars = /[^a-zA-Z0-9-_.~]/g
  const urlFriendlyName = name.replaceAll(' ', '-').replaceAll(allowedChars, '')

  return (
    <div className="odd:col-start-2 col-span-3 relative flex flex-col h-[248px] border border-indigo-600 rounded mb-16 md:odd:col-start-auto md:col-start-2 lg:col-start-auto">
      <div className="flex-grow relative">
        <Image src={image} alt={name} layout="fill" />
      </div>
      <div className="px-8 py-4 bg-indigo-600">
        <Link href={`/posts/${id}/${urlFriendlyName}`} className="text-white">
          {truncatedName} →
        </Link>
      </div>
      <div className="absolute bg-white rounded text-indigo-600 px-4 py-2 top-8 right-8">
        {addCommasToNb(price)}€
      </div>
    </div>
  )
}

export default Post
