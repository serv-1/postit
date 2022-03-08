import axios, { AxiosError } from 'axios'
import { ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import { useToast } from '../contexts/toast'
import Button from './Button'
import getAxiosError from '../utils/functions/getAxiosError'
import err from '../utils/constants/errors'

interface ProfileChangeImageProps {
  image: string
}

const ProfileChangeImage = ({ image: img }: ProfileChangeImageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState(img)
  const { setToast } = useToast()

  const updateImage = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)) {
      return setToast({ message: err.IMAGE_INVALID, error: true })
    }

    if (files[0].size > 1000000) {
      return setToast({ message: err.IMAGE_TOO_BIG, error: true })
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      if (!e.target?.result) return
      try {
        const res = await axios.get('http://localhost:3000/api/auth/csrf')

        const base64 = (e.target.result as string).split(',')[1]

        await axios.put<null>('http://localhost:3000/api/user', {
          csrfToken: res.data.csrfToken,
          image: { base64, type: files[0].type.split('/')[1] },
        })

        setImage(e.target.result as string)
        setToast({ message: 'The image has been updated! 🎉' })
      } catch (e) {
        const { message } = getAxiosError(e as AxiosError)
        setToast({ message, error: true })
      }
    }

    reader.readAsDataURL(files[0])
  }

  return (
    <>
      <Button
        needDefaultClassNames={false}
        className="mb-16 w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={image}
          width={160}
          height={160}
          alt="Your profile image"
          title="Click to change your profile image"
          className="rounded-full"
        />
      </Button>
      <input
        onChange={updateImage}
        ref={fileInputRef}
        data-testid="fileInput"
        type="file"
        name="image"
        id="image"
        aria-label="Change your profile image"
        className="hidden"
      />
    </>
  )
}

export default ProfileChangeImage
