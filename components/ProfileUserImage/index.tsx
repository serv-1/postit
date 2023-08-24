import axios from 'axios'
import { ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import { useToast } from 'contexts/toast'
import getAxiosError from 'utils/functions/getAxiosError'
import { getCsrfToken } from 'next-auth/react'
import Plus from 'public/static/images/plus.svg'
import err from 'utils/constants/errors'
import isImage from 'utils/functions/isImage'
import isImageTooBig from 'utils/functions/isImageTooBig'

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

interface Response {
  url: string
  key: string
  fields: Record<string, string>
}

interface ProfileUserImageProps {
  image?: string
}

export default function ProfileUserImage({
  image: img,
}: ProfileUserImageProps) {
  const defaultImage = img ? awsUrl + img : '/static/images/default.jpg'

  const [image, setImage] = useState(defaultImage)
  const { setToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const updateImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    if (!isImage(file.type)) {
      return setToast({ message: err.IMAGE_INVALID, error: true })
    }

    if (isImageTooBig(file.size)) {
      return setToast({ message: err.IMAGE_TOO_BIG, error: true })
    }

    try {
      const csrfToken = await getCsrfToken()

      const res = await axios.get<Response>('/api/s3?csrfToken=' + csrfToken)
      const { url, fields, key } = res.data

      const formData = new FormData()
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
      formData.append('file', file)

      await axios.post(url, formData)

      await axios.put('/api/user', { csrfToken, image: key })

      setImage(awsUrl + key)
      setToast({ message: 'The image has been updated! 🎉' })
    } catch (e) {
      const { message, status } = getAxiosError(e)

      if (status === 400) {
        return setToast({ message: err.IMAGE_TOO_BIG, error: true })
      } else if (!message) {
        return setToast({ message: err.DEFAULT, error: true })
      }

      return setToast({ message, error: true })
    }
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
