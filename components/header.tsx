import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import Button from './Button'
import { MouseEvent as ReactMouseEvent, useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import getAxiosError from '../utils/functions/getAxiosError'
import { useToast } from '../contexts/toast'
import { useRouter } from 'next/router'
import Link from './Link'
import Spinner from './Spinner'
import { usePopper } from 'react-popper'

type PopperElement = HTMLDivElement | null
type ReferenceElement = HTMLButtonElement | null
type ArrowElement = HTMLDivElement | null

const Header = () => {
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
    if (status === 'authenticated' && pathname !== '/profile') getImage()
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

  const onClickSignOut = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="py-4 px-16 my-16 flex justify-between items-center">
      <Link href="/" className="font-bold text-m-2xl">
        Filanad
      </Link>
      <nav>
        {status === 'authenticated' ? (
          <ul className="flex items-center h-32 md:h-40">
            <li className="bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold mr-8 md:mr-16">
              <Link href="/create-a-post">Create a post</Link>
            </li>
            {pathname !== '/profile' && (
              <li className="w-40 h-40">
                <Button
                  needDefaultClassNames={false}
                  className="w-full h-full"
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
                      layout="responsive"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <Spinner />
                  )}
                </Button>
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
                        <Link
                          href="/profile"
                          className="pb-8 hover:underline inline-block w-full"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/api/auth/signout"
                          className="hover:underline inline-block w-full"
                          onClick={onClickSignOut}
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
            )}
          </ul>
        ) : status === 'unauthenticated' ? (
          <div className="bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold">
            <Link
              href="/api/auth/signin"
              onClick={(e) => {
                e.preventDefault()
                signIn()
              }}
            >
              Sign in
            </Link>
          </div>
        ) : null}
      </nav>
    </header>
  )
}

export default Header
