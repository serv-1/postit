import { type ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import useToast from 'hooks/useToast'
import Plus from 'public/static/images/plus.svg'
import isImage from 'functions/isImage'
import ajax from 'libs/ajax'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import type { S3GetData, S3GetError } from 'app/api/s3/types'
import type { UserPutError } from 'app/api/user/types'
import { MAX_IMAGE_SIZE } from 'constants/index'
import { IMAGE_INVALID, IMAGE_TOO_BIG, DEFAULT } from 'constants/errors'

interface ProfileUserImageProps {
  image?: string
}

export default function ProfileUserImage({
  image: img,
}: ProfileUserImageProps) {
  const [image, setImage] = useState(
    img ? NEXT_PUBLIC_AWS_URL + '/' + img : NEXT_PUBLIC_DEFAULT_USER_IMAGE
  )
  const { setToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const updateImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]

    if (!file) {
      return
    }

    if (!isImage(file)) {
      return setToast({ message: IMAGE_INVALID, error: true })
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return setToast({ message: IMAGE_TOO_BIG, error: true })
    }

    let response = await ajax.get('/s3', { csrf: true })

    if (!response.ok) {
      const { message }: S3GetError = await response.json()

      setToast({ message, error: true })

      return
    }

    const { url, fields, key }: S3GetData = await response.json()
    const formData = new FormData()

    Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
    formData.append('file', file)

    response = await fetch(url, { method: 'POST', body: formData })

    if (!response.ok) {
      setToast({ message: DEFAULT, error: true })

      return
    }

    response = await ajax.put('/user', { image: key }, { csrf: true })

    if (!response.ok) {
      const { message }: UserPutError = await response.json()

      setToast({ message, error: true })

      return
    }

    setImage(NEXT_PUBLIC_AWS_URL + '/' + key)
    setToast({ message: 'The image has been updated! 🎉' })
  }

  return (
    <div className="mr-8 md:mr-16">
      <label
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          inputRef.current?.click()
        }}
        htmlFor="userImage"
        aria-label="Change your profile image"
        className="block relative group cursor-pointer w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
      >
        <Image
          src={image}
          fill
          alt="Your profile image"
          title="Click to change your profile image"
          className="rounded-full group-hover:grayscale transition-[filter] duration-200 object-cover"
        />
        <Plus className="w-[20px] h-[20px] rounded-full bg-fuchsia-50 text-fuchsia-600 absolute bottom-0 right-0 group-hover:bg-fuchsia-900 group-hover:text-fuchsia-50 transition-colors duration-200 md:w-24 md:h-24" />
      </label>
      <input
        ref={inputRef}
        onChange={updateImage}
        type="file"
        name="image"
        id="userImage"
        className="hidden"
      />
    </div>
  )
}
