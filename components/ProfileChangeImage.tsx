import axios, { AxiosError } from 'axios'
import { ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import { useToast } from '../contexts/toast'
import Button from './Button'
import getAxiosError from '../utils/functions/getAxiosError'
import isImageValid from '../utils/functions/isImageValid'
import readAsDataUrl from '../utils/functions/readAsDataUrl'
import { IImage } from '../types/common'

interface ProfileChangeImageProps {
  image: string
}

const ProfileChangeImage = ({ image: img }: ProfileChangeImageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState(img)
  const { setToast } = useToast()

  const updateImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    const message = isImageValid(files[0])

    if (message) {
      return setToast({ message, error: true })
    }

    const result = await readAsDataUrl<IImage['ext']>(files[0])

    if (typeof result === 'string') {
      setToast({ message: result, error: true })
    } else {
      try {
        const res = await axios.get('http://localhost:3000/api/auth/csrf')

        await axios.put('http://localhost:3000/api/user', {
          csrfToken: res.data.csrfToken,
          image: result,
        })

        setImage(`data:image/${result.ext};base64,${result.base64}`)
        setToast({ message: 'The image has been updated! 🎉' })
      } catch (e) {
        const { message } = getAxiosError(e as AxiosError)
        setToast({ message, error: true })
      }
    }
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
