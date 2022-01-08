import axios, { AxiosError } from 'axios'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import err from '../utils/errors'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { useToast } from '../contexts/toast'

const UpdateImage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string>()
  const { setToast } = useToast()
  const { data } = useSession()
  const { id } = (data as Session).user

  useEffect(() => {
    async function getImage() {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${id}`)
        setImage(res.data.image)
      } catch (e) {
        const res = (e as AxiosError).response
        if (!res) {
          return setToast({ message: err.NO_RESPONSE, background: 'danger' })
        }
        setToast({ message: err.IMAGE_NOT_FOUND, background: 'danger' })
      }
    }
    getImage()
  }, [id, setToast])

  const updateImage = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)) {
      return setToast({ message: err.USER_IMAGE_INVALID, background: 'danger' })
    } else if (files[0].size > 1000000) {
      return setToast({
        message: err.USER_IMAGE_TOO_LARGE,
        background: 'danger',
      })
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      if (!e.target?.result) return
      try {
        await axios.put<null>(`http://localhost:3000/api/users/${id}`, {
          image: { base64Uri: e.target.result, type: files[0].type },
        })
        setToast({
          message: 'The image has been updated! 🎉',
          background: 'success',
        })
        setImage(e.target.result as string)
      } catch (e) {
        const res = (e as AxiosError).response
        if (!res) {
          return setToast({ message: err.NO_RESPONSE, background: 'danger' })
        }
        setToast({
          message: res.data.message || err.DEFAULT_SERVER_ERROR,
          background: 'danger',
        })
      }
    }

    reader.readAsDataURL(files[0])
  }

  return (
    <>
      <button
        type="button"
        tabIndex={0}
        className={`d-block m-auto p-0 bg-white border-0 shadow rounded-circle`}
        style={{ width: 200, height: 200, cursor: 'pointer' }}
        onClick={() => fileInputRef.current?.click()}
      >
        {image && (
          <Image
            src={image}
            width={200}
            height={200}
            alt="Your profile image"
            title="Click to change your profile image"
            className="rounded-circle"
          />
        )}
      </button>
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

export default UpdateImage
