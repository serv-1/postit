import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import axios, { AxiosError } from 'axios'
import err from '../utils/errors'

const Profile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data } = useSession()
  const { id, name, email } = (data as Session).user
  const [image, setImage] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    async function getImage() {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${id}`)
        setImage(res.data.image)
      } catch (e) {
        const res = (e as AxiosError).response
        if (!res) return setError(err.NO_RESPONSE)
        setError(err.IMAGE_NOT_FOUND)
      }
    }
    getImage()
  }, [id])

  const updateImage = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)) {
      return setError(err.USER_IMAGE_INVALID)
    } else if (files[0].size > 1000000) {
      return setError(err.USER_IMAGE_TOO_LARGE)
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      if (!e.target?.result) return
      try {
        await axios.put<null>(`http://localhost:3000/api/users/${id}`, {
          image: { base64Uri: e.target.result, type: files[0].type },
        })
        setImage(e.target.result as string)
      } catch (e) {
        const res = (e as AxiosError).response
        if (!res) return setError(err.NO_RESPONSE)
        setError(res.data.message || err.DEFAULT_SERVER_ERROR)
      }
    }

    reader.readAsDataURL(files[0])
  }

  return (
    <main data-cy="profile" className="my-4">
      {error && <div role="alert">{error}</div>}
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
      <h1 className="text-center my-2">
        {name}
        <small className="fs-6 d-block">({email})</small>
      </h1>
    </main>
  )
}

Profile.needAuth = true

export default Profile
