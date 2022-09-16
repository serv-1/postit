import axios, { AxiosError } from 'axios'
import { ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import isImageValid from '../utils/functions/isImageValid'
import readAsDataUrl from '../utils/functions/readAsDataUrl'
import { Image as IImage } from '../types/common'
import { getCsrfToken } from 'next-auth/react'
import Plus from '../public/static/images/plus.svg'

interface ProfileUserImageProps {
  image: string
}

const ProfileUserImage = ({ image: img }: ProfileUserImageProps) => {
  const [image, setImage] = useState(img)
  const { setToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

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
        const csrfToken = await getCsrfToken()
        await axios.put('/api/user', { csrfToken, image: result })

        setImage(`data:image/${result.ext};base64,${result.base64}`)
        setToast({ message: 'The image has been updated! 🎉' })
      } catch (e) {
        const { message } = getAxiosError(e as AxiosError)
        setToast({ message, error: true })
      }
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
          layout="fill"
          objectFit="cover"
          alt="Your profile image"
          title="Click to change your profile image"
          className="rounded-full group-hover:grayscale transition-[filter] duration-200"
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

export default ProfileUserImage
