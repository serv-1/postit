import { useState, useEffect } from 'react'
import Image from 'next/image'
import Pulser from './Pulser'
import Link from './Link'
import { signOut, useSession } from 'next-auth/react'
import { useToast } from '../contexts/toast'
import { usePopper } from 'react-popper'
import getAxiosError from '../utils/functions/getAxiosError'
import axios, { AxiosError } from 'axios'

type PopperElement = HTMLDivElement | null
type ReferenceElement = HTMLButtonElement | null
type ArrowElement = HTMLDivElement | null

const HeaderDropdownMenu = () => {
  const [image, setImage] = useState<string>()
  const [isOpen, setIsOpen] = useState(false)
  const [popperElement, setPopperElement] = useState<PopperElement>(null)
  const [arrowElement, setArrowElement] = useState<ArrowElement>(null)
  const [referenceElement, setReferenceElement] =
    useState<ReferenceElement>(null)

  const { data, status } = useSession()
  const id = data?.id

  const { setToast } = useToast()
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 6] } },
    ],
  })

  useEffect(() => {
    const getImage = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${id}`)
        setImage(res.data.image)
      } catch (e) {
        const { message } = getAxiosError(e as AxiosError)
        setToast({ message, error: true })
      }
    }
    if (status === 'authenticated') getImage()
  }, [id, setToast, status])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const menu = (e.target as Element).closest('#mainHeaderMenu')
      if (menu) return

      setIsOpen(false)
    }

    document.addEventListener('click', onClick)

    return () => document.removeEventListener('click', onClick)
  }, [setIsOpen])

  return (
    <div className="w-40 h-40">
      <button
        className="w-full h-full relative"
        onClick={(e) => {
          setIsOpen(!isOpen)
          e.stopPropagation()
        }}
        ref={(r) => setReferenceElement(r)}
      >
        {image ? (
          <Image
            src={image}
            alt="Your profile image"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        ) : (
          <Pulser />
        )}
      </button>
      {isOpen && (
        <div
          ref={(r) => setPopperElement(r)}
          style={styles.popper}
          {...attributes.popper}
          className="z-10"
        >
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
          <div
            ref={(r) => setArrowElement(r)}
            style={styles.arrow}
            className="w-8 h-8 bg-fuchsia-50 invisible absolute -top-4 before:absolute before:visible before:w-8 before:h-8 before:bg-fuchsia-50 before:rotate-45 -z-10"
          ></div>
        </div>
      )}
    </div>
  )
}

export default HeaderDropdownMenu
