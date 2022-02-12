import Image from 'next/image'
import ArrowRight from '../public/static/images/arrow-right.svg'
import Link from 'next/link'

export interface PostsPagePostProps {
  id: string
  name: string
  price: number
  image: string
}

const PostsPagePost = ({ id, name, price, image }: PostsPagePostProps) => {
  const truncatedName = name.length > 25 ? name.slice(0, 25) + '...' : name
  const allowedChars = /[^a-zA-Z0-9-_.~]/g
  const urlFriendlyName = name.replaceAll(' ', '-').replaceAll(allowedChars, '')

  return (
    <div className="card border-primary">
      <div>
        <Image
          className="card-img-top"
          src={image}
          alt={name}
          layout="responsive"
          width={200}
          height={200}
        />
      </div>
      <div className="card-body">
        <h5 className="card-title m-0 fw-normal">
          <Link href={`/posts/${id}/${urlFriendlyName}`}>
            <a className="text-decoration-none">
              {truncatedName} <ArrowRight />
            </a>
          </Link>
        </h5>
      </div>
      <span className="position-absolute end-0 bg-white p-1 m-2 rounded fw-bold">
        {price}€
      </span>
    </div>
  )
}

export default PostsPagePost
