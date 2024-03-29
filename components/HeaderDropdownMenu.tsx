import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from './Link'
import { signOut, useSession } from 'next-auth/react'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import axios, { AxiosError } from 'axios'
import Popup from './Popup'
import { Session } from 'next-auth'
import { User } from '../types/common'

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'
const defaultUserImage = process.env.NEXT_PUBLIC_DEFAULT_USER_IMAGE

const HeaderDropdownMenu = () => {
  const [image, setImage] = useState<string>(defaultUserImage as string)

  const { setToast } = useToast()
  const { data } = useSession() as { data: Session }
  const { id } = data

  useEffect(() => {
    const getImage = async () => {
      try {
        const { data } = await axios.get<User>('/api/users/' + id)
        if (data.image) setImage(awsUrl + data.image)
      } catch (e) {
        const { message } = getAxiosError(e as AxiosError)
        setToast({ message, error: true })
      }
    }
    getImage()
  }, [id, setToast])

  return (
    <Popup
      openOnHover
      placement="bottom-end"
      containerClassName="w-40 h-40"
      arrowClassName="w-8 absolute top-4 before:absolute before:visible before:w-8 before:h-8 before:bg-fuchsia-50 before:rotate-45 -z-10"
      referenceClassName="w-full h-full relative cursor-pointer"
      referenceContent={
        <Image
          src={image}
          alt="Your profile image"
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      }
      popupClassName="z-10 pt-8"
      popupContent={
        <ul
          id="mainHeaderMenu"
          className="p-16 bg-fuchsia-50 rounded-8 font-bold shadow-[-8px_8px_8px_rgba(112,26,117,0.05)]"
        >
          <li>
            <Link
              href="/profile"
              className="pb-8 inline-block w-full hover:underline"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              href="/api/auth/signout"
              className="inline-block w-full hover:underline"
              onClick={(e) => {
                e.preventDefault()
                signOut({ callbackUrl: '/' })
              }}
            >
              Sign out
            </Link>
          </li>
        </ul>
      }
    />
  )
}

export default HeaderDropdownMenu
