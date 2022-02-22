import Plus from '../public/static/images/plus.svg'
import Image from 'next/image'

interface PostsListPostImagesProps {
  images: string[]
  id: string
}

const PostsListPostImages = ({ images }: PostsListPostImagesProps) => {
  return (
    <div
      className="position-absolute start-0 top-0 w-100 p-2 bg-white border border-dark border-bottom-0 rounded-top"
      style={{ transform: 'translateY(-100%)', zIndex: 9999 }}
    >
      <div className="row g-2">
        {images.map((image) => (
          <div key={image} className="col-md-2">
            <Image
              src={image}
              alt="" // TODO
              layout="responsive"
              width={200}
              height={200}
              className="rounded"
            />
            <div></div>
          </div>
        ))}
        {images.length < 5 && (
          <div className="col-md-2">
            <div className="bg-secondary rounded">
              <Plus className="w-100 h-100 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostsListPostImages
