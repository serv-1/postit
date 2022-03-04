import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import Button from './Button'
import { MouseEvent, useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import getAxiosError from '../utils/functions/getAxiosError'
import { useToast } from '../contexts/toast'
import { useRouter } from 'next/router'
import BoxArrowRight from '../public/static/images/box-arrow-right.svg'
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
        setToast({ message, background: 'danger' })
      }
    }
    if (status === 'authenticated' && pathname !== '/profile') getImage()
  }, [id, setToast, status, pathname])

  const onClickSignOut = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="shadow-md flex justify-between items-center p-8">
      <Link href="/" className="text-4xl md:text-t-3xl lg:text-d-2xl">
        Filanad
      </Link>
      <nav>
        {status === 'authenticated' ? (
          <ul className="flex h-32 md:h-40">
            <li>
              <Link
                href="/create-a-post"
                needButtonStyle
                className="mr-8 inline-block font-bold md:px-16 md:py-8"
              >
                Create a post
              </Link>
            </li>
            {pathname !== '/profile' ? (
              <li>
                <Button
                  needDefaultClassNames={false}
                  className="w-32 h-32 md:w-40 md:h-40"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  ref={(r) => setReferenceElement(r)}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt="Your profile image"
                      layout="responsive"
                      width={32}
                      height={32}
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
                  >
                    <ul className="bg-white border-indigo-600 border-2 rounded">
                      <li>
                        <Link
                          href="/profile"
                          className="px-8 py-4 hover:bg-indigo-200 inline-block w-full"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/api/auth/signout"
                          className="px-8 py-4 hover:bg-indigo-200 inline-block w-full"
                          onClick={onClickSignOut}
                        >
                          Sign out
                        </Link>
                      </li>
                    </ul>
                    <div
                      ref={(r) => setArrowElement(r)}
                      style={styles.arrow}
                      className="w-8 h-8 bg-indigo-600 invisible absolute -top-4 before:absolute before:visible before:w-8 before:h-8 before:bg-indigo-600 before:rotate-45 -z-10"
                    ></div>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link
                  href="/api/auth/signout"
                  onClick={onClickSignOut}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <BoxArrowRight width={32} height={32} />
                </Link>
              </li>
            )}
          </ul>
        ) : status === 'unauthenticated' ? (
          <Link
            href="/api/auth/signin"
            needButtonStyle
            className="md:px-16 md:py-8"
            onClick={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            Sign in
          </Link>
        ) : null}
      </nav>
    </header>
  )
}

export default Header
