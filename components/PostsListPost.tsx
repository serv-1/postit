import { Post } from '../types/common'
import PostsListPostImages from './PostsListPostImages'
import Image from 'next/image'
import addCommasToNb from '../utils/functions/addCommasToNb'
import { useState } from 'react'
import classNames from 'classnames'

interface PostsListPostProps {
  post: Post
}

const PostsListPost = ({ post }: PostsListPostProps) => {
  const [showImages, setShowImages] = useState(false)

  const cardClass = classNames(
    'card position-relative',
    showImages ? 'rounded-0 rounded-bottom border-dark' : 'rounded'
  )

  return (
    <div className="position-relative">
      <div className={cardClass}>
        <div className="row g-0">
          <div className="col-md-2 position-relative">
            <Image
              src={post.images[0]}
              layout="fill"
              width={100}
              height={100}
              alt={post.name}
              className={showImages ? 'rounded-top-start' : 'rounded-start'}
              onClick={() => setShowImages(!showImages)}
            />
          </div>
          <div className="col">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="m-0">{post.name}</h5>
              <div className="fs-5">{addCommasToNb(post.price)}€</div>
            </div>
            <div className="card-body">
              <p className="card-text mb-2">{post.description}</p>
              <div className="text-end">
                {post.categories.map((category) => (
                  <span
                    key={category}
                    className="border border-dark px-1 rounded ms-1"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showImages && <PostsListPostImages images={post.images} id={post.id} />}
    </div>
  )
}

export default PostsListPost
