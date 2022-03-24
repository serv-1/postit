import Image from 'next/image'
import { useEffect, useState } from 'react'

interface PostImagesProps {
  images: string[]
}

const PostImages = ({ images }: PostImagesProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0])

  useEffect(() => setSelectedImage(images[0]), [images])

  return (
    <div className="col-span-full mb-16 rounded overflow-clip md:flex md:flex-row md:flex-nowrap">
      <div className="md:flex-grow order-2">
        <Image
          src={selectedImage}
          alt=""
          layout="responsive"
          width={336}
          height={336}
        />
      </div>
      {images.length > 1 ? (
        <div className="flex flex-row flex-nowrap md:flex-col">
          {images.map((image) => {
            return (
              <div
                key={image}
                className="h-[67px] w-[67.2px] md:h-[85px] md:w-[86px]"
              >
                <Image
                  src={image}
                  alt=""
                  layout="responsive"
                  width={67}
                  height={67}
                  onClick={() => setSelectedImage(image)}
                />
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default PostImages
