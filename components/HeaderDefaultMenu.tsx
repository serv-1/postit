import axios, { AxiosError } from 'axios'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import Link from './Link'
import Pulser from './Pulser'

type PopperElement = HTMLDivElement | null
type ReferenceElement = HTMLButtonElement | null
type ArrowElement = HTMLDivElement | null

const HeaderDefaultMenu = () => {
  const [image, setImage] = useState<string>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [popperElement, setPopperElement] = useState<PopperElement>(null)
  const [arrowElement, setArrowElement] = useState<ArrowElement>(null)
  const [referenceElement, setReferenceElement] =
    useState<ReferenceElement>(null)

  const { data, status } = useSession()
  const id = data?.id

  const { setToast } = useToast()
  const { pathname } = useRouter()
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
  }, [id, setToast, status, pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const menu = (e.target as Element).closest('#mainHeaderMenu')
      if (menu) return

      setIsMenuOpen(false)
    }

    document.addEventListener('click', onClick)

    return () => document.removeEventListener('click', onClick)
  }, [setIsMenuOpen])

  return (
    <nav>
      {status === 'unauthenticated' ? (
        <a
          href={'/authentication'}
          className="block bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold mr-8 md:mr-16"
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          Sign in
        </a>
      ) : status === 'authenticated' ? (
        <ul className="flex items-center h-32 md:h-40">
          <li className="bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold mr-8 md:mr-16">
            <Link href="/create-a-post">Create a post</Link>
          </li>
          <li className="w-40 h-40">
            <button
              className="w-full h-full relative"
              onClick={(e) => {
                setIsMenuOpen(!isMenuOpen)
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
            {isMenuOpen && (
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
                    <Link href="/profile" className="pb-8 inline-block w-full">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/api/auth/signout"
                      className="inline-block w-full"
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
          </li>
        </ul>
      ) : null}
    </nav>
  )
}

export default HeaderDefaultMenu
