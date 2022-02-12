import Link from 'next/link'
import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import Button from './Button'
import { useEffect, useState } from 'react'
import axios from 'axios'
import getApiError from '../utils/functions/getApiError'
import { useToast } from '../contexts/toast'
import { useRouter } from 'next/router'
import BoxArrowRight from '../public/static/images/box-arrow-right.svg'

const Header = () => {
  const { data, status } = useSession()
  const id = data?.id

  const { setToast } = useToast()
  const { pathname } = useRouter()

  const [image, setImage] = useState<string>()

  useEffect(() => {
    const getImage = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${id}`)
        setImage(res.data.image)
      } catch (e) {
        const { message } = getApiError(e)
        setToast({ message, background: 'danger' })
      }
    }
    if (status === 'authenticated' && pathname !== '/profile') getImage()
  }, [id, setToast, status, pathname])

  return (
    <header className="container-fluid d-flex justify-content-between align-items-center shadow-sm">
      <div className="m-0 fs-1">
        <Link href="/">
          <a className="text-decoration-none text-dark">Filanad</a>
        </Link>
      </div>
      <nav>
        <ul className="nav">
          {status === 'authenticated' ? (
            <>
              <li className="nav-item">
                <Link href="/create-a-post">
                  <a className="btn btn-success fs-5">Create a post</a>
                </Link>
              </li>
              {pathname !== '/profile' ? (
                <li className="nav-item dropdown">
                  <Button
                    className="p-0 ms-3 d-block"
                    style={{ width: 44, height: 44 }}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt="Your profile image"
                        layout="responsive"
                        width={44}
                        height={44}
                        className="rounded-circle"
                      />
                    ) : (
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </Button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="profileDropdown"
                  >
                    <li className="dropdown-item">
                      <Link href="/profile">
                        <a className="btn text-decoration-none text-dark">
                          Profile
                        </a>
                      </Link>
                    </li>
                    <li className="dropdown-item">
                      <a
                        href={'/api/auth/signout'}
                        className="btn text-decoration-none text-dark"
                        onClick={(e) => {
                          e.preventDefault()
                          signOut({ callbackUrl: '/' })
                        }}
                      >
                        Sign out
                      </a>
                    </li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item ms-3">
                  <a
                    href={'/api/auth/signout'}
                    className="btn px-0 text-dark"
                    onClick={(e) => {
                      e.preventDefault()
                      signOut({ callbackUrl: '/' })
                    }}
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <BoxArrowRight width={33} height={33} />
                  </a>
                </li>
              )}
            </>
          ) : status === 'unauthenticated' ? (
            <li className="nav-item">
              <a
                href={'/api/auth/signin'}
                className="btn btn-primary text-decoration-none fs-5"
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
                }}
              >
                Sign in
              </a>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  )
}

export default Header
