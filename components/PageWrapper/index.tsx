'use client'

import type { UsersIdGetError } from 'app/api/users/[id]/types'
import classNames from 'classnames'
import Header from 'components/Header'
import {
  POST_PAGE_REGEX,
  POST_UPDATE_PAGE_REGEX,
  USER_PAGE_REGEX,
} from 'constants/regex'
import useToast from 'hooks/useToast'
import ajax from 'libs/ajax'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from 'types'

export default function PageWrapper({
  children,
  signedInUser: signedInUserProp,
}: {
  children: React.ReactNode
  signedInUser?: User
}) {
  const [signedInUser, setUser] = useState(signedInUserProp)
  const session = useSession()
  const path = usePathname()
  const { setToast } = useToast()

  useEffect(() => {
    if (
      path === '/authentication' ||
      session.status !== 'authenticated' ||
      signedInUser
    ) {
      return
    }

    async function initUser() {
      const response = await ajax.get('/users/' + session.data!.id)

      if (!response.ok) {
        const { message }: UsersIdGetError = await response.json()

        setToast({ message, error: true })

        return
      }

      setUser(await response.json())
    }

    initUser()
  }, [signedInUser, session, setToast, path])

  const isBgLinear =
    path === '/authentication' ||
    path === '/create-a-post' ||
    path === '/mail-sent' ||
    path.match(POST_UPDATE_PAGE_REGEX) ||
    // ↓ to match 404 page
    (!path.match(POST_PAGE_REGEX) &&
      !path.match(USER_PAGE_REGEX) &&
      path !== '/profile' &&
      path !== '/')

  return (
    <div className={classNames('px-16', isBgLinear && 'bg-linear-page')}>
      <div
        className={classNames(
          'flex flex-col min-h-screen md:max-w-[1200px] xl:m-auto',
          isBgLinear && 'mx-auto max-w-[450px]'
        )}
      >
        <Header signedInUser={signedInUser} />
        {children}
        <footer className="text-s p-8">
          Copyright © {new Date().getFullYear()} PostIt. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
