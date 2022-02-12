import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'

interface PostImagesProps {
  images: string[]
}

const PostImages = ({ images }: PostImagesProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0])

  return (
    <div className="col-md-5">
      <div className="row">
        {images.length > 1 ? (
          <div className="col-md-2 p-0">
            {images.map((image) => {
              const className = classNames({
                'border border-5 border-white': image === selectedImage,
              })

              return (
                <Image
                  key={image}
                  src={image}
                  alt=""
                  layout="responsive"
                  width="100"
                  height="100"
                  className={className}
                  onClick={() => setSelectedImage(image)}
                />
              )
            })}
          </div>
        ) : null}
        <div className="col p-0">
          <Image
            src={selectedImage}
            alt=""
            layout="responsive"
            width="200"
            height="200"
          />
        </div>
      </div>
    </div>
  )
}

export default PostImages
