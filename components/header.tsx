import Link from 'next/link'
import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import Button from './Button'
import { useEffect, useState } from 'react'
import axios from 'axios'
import getApiError from '../utils/functions/getApiError'
import { useToast } from '../contexts/toast'

const Header = () => {
  const { data, status } = useSession()
  const id = data?.user.id
  const { setToast } = useToast()
  const [image, setImage] = useState<string>()

  useEffect(() => {
    async function getImage() {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${id}`)
        setImage(res.data.image)
      } catch (e) {
        const { message } = getApiError(e)
        setToast({ message, background: 'danger' })
      }
    }
    if (status === 'authenticated') getImage()
  }, [id, setToast, status])

  return (
    <header className="container-fluid d-flex justify-content-between align-items-center pe-0 shadow-sm">
      <div className="m-0 fs-1">
        <Link href="/">
          <a className="text-decoration-none text-dark">Filanad</a>
        </Link>
      </div>
      <nav className="nav">
        {status === 'authenticated' ? (
          <>
            <Link href="/create-a-post">
              <a className="btn btn-success fs-5">Create a post</a>
            </Link>
            <div className="dropdown">
              <Button
                className="p-0 mx-3 d-block"
                style={{ width: 44, height: 44 }}
                data-cy="headerProfileDropdown"
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
              <ul className="dropdown-menu" aria-labelledby="profileDropdown">
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
                      signOut()
                    }}
                  >
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          </>
        ) : status === 'unauthenticated' ? (
          <a
            href={'/api/auth/signin'}
            className="btn btn-primary text-decoration-none fs-5 me-3"
            onClick={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            Sign in
          </a>
        ) : null}
      </nav>
    </header>
  )
}

export default Header
