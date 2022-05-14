import Image from 'next/image'
import addSpacesToNb from '../utils/functions/addSpacesToNb'
import formatToUrl from '../utils/functions/formatToUrl'
import Link from './Link'

interface PostProps {
  id: string
  name: string
  price: number
  image: string
}

const Post = ({ id, name, price, image }: PostProps) => {
  const truncatedName = name.length > 23 ? name.slice(0, 22) + '...' : name

  return (
    <figure className="w-full h-full">
      <Image
        src={image}
        alt={name}
        layout="responsive"
        width="328"
        height="328"
        className="rounded-8 object-cover"
      />
      <figcaption className="px-8 py-4 text-center">
        <Link
          href={`/posts/${id}/${formatToUrl(name)}`}
          className="text-fuchsia-600 hover:underline"
        >
          {truncatedName} - {addSpacesToNb(price)}€
        </Link>
      </figcaption>
    </figure>
  )
}

export default Post
