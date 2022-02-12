import axios from 'axios'
import { ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import { useToast } from '../contexts/toast'
import Button from './Button'
import getApiError from '../utils/functions/getApiError'
import err from '../utils/constants/errors'

interface ProfileChangeImageProps {
  id: string
  image: string
}

const ProfileChangeImage = ({ id, image: img }: ProfileChangeImageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState(img)
  const { setToast } = useToast()

  const updateImage = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)) {
      return setToast({ message: err.IMAGE_INVALID, background: 'danger' })
    }

    if (files[0].size > 1000000) {
      return setToast({
        message: err.IMAGE_TOO_LARGE,
        background: 'danger',
      })
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      if (!e.target?.result) return
      try {
        const res = await axios.get('http://localhost:3000/api/auth/csrf')

        const base64 = (e.target.result as string).split(',')[1]

        await axios.put<null>(`http://localhost:3000/api/users/${id}`, {
          csrfToken: res.data.csrfToken,
          image: { base64, type: files[0].type.split('/')[1] },
        })

        setImage(e.target.result as string)
        setToast({
          message: 'The image has been updated! 🎉',
          background: 'success',
        })
      } catch (e) {
        const { message } = getApiError(e)
        setToast({ message, background: 'danger' })
      }
    }

    reader.readAsDataURL(files[0])
  }

  return (
    <>
      <Button
        className="d-block m-auto p-0 bg-white border-0 shadow rounded-circle"
        style={{ width: 200, height: 200 }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={image}
          width={200}
          height={200}
          alt="Your profile image"
          title="Click to change your profile image"
          className="rounded-circle"
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
        className="d-none"
      />
    </>
  )
}

export default ProfileChangeImage
