import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import useToast from 'hooks/useToast'
import Popup from 'components/Popup'
import type { Session } from 'next-auth'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import ajax from 'libs/ajax'
import type { UsersIdGetData, UsersIdGetError } from 'app/api/users/[id]/types'

export default function HeaderDropdownMenu() {
  const [image, setImage] = useState<string>(NEXT_PUBLIC_DEFAULT_USER_IMAGE)

  const { setToast } = useToast()
  const session = useSession() as { data: Session }

  useEffect(() => {
    async function getImage() {
      const response = await ajax.get('/users/' + session.data.id)

      if (!response.ok) {
        const { message }: UsersIdGetError = await response.json()

        setToast({ message, error: true })

        return
      }

      const data: UsersIdGetData = await response.json()

      if (data.image) {
        setImage(NEXT_PUBLIC_AWS_URL + '/' + data.image)
      }
    }
    getImage()
  }, [session.data.id, setToast])

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
          fill
          className="rounded-full object-cover"
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
