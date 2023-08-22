'use client'

import ProfileUserImage from 'components/ProfileUserImage'
import { signOut } from 'next-auth/react'
import type { LightPost, Post, User } from 'types/common'
import Header from 'components/Header'
import Link from 'components/Link'
import SignOut from 'public/static/images/sign-out.svg'
import { TabsProvider } from 'contexts/tabs'
import TabList from 'components/TabList'
import Tab from 'components/Tab'
import TabPanel from 'components/TabPanel'
import UpdateAccountForm from 'components/UpdateAccountForm'
import DeleteAccountModal from 'components/DeleteAccountModal'
import ProfilePostList from 'components/ProfilePostList'
import formatToUrl from 'utils/functions/formatToUrl'
import { useState } from 'react'

export default function Profile({
  user,
  csrfToken,
}: {
  user: Omit<User, 'postIds' | 'favPostIds'> & {
    posts: Post[]
    favPosts: Omit<LightPost, 'price' | 'address'>[]
  }
  csrfToken?: string
}) {
  const [name, setName] = useState(user.name)

  return (
    <>
      <Header />
      <main className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-24">
        <div className="col-span-full">
          <div className="mb-32 p-8 md:flex md:flex-row md:flex-nowrap md:items-center md:bg-fuchsia-100 md:rounded-16 md:p-16">
            <div className="flex-grow flex flex-row flex-nowrap items-center min-w-0 mb-8 md:mb-0 md:mr-16">
              <ProfileUserImage image={user.image} />
              <h1 className="truncate w-full mr-8 md:w-auto md:mr-16">
                {name}
              </h1>
              <Link
                href="/sign-out"
                onClick={(e) => {
                  e.preventDefault()
                  signOut({ callbackUrl: '/' })
                }}
                className="text-fuchsia-600 hover:text-fuchsia-900 transition-colors duration-200"
                aria-label="Sign out"
              >
                <SignOut className="w-32 h-32" />
              </Link>
            </div>
            <Link
              href={`/users/${user.id}/${formatToUrl(name)}`}
              className="bg-fuchsia-200 text-fuchsia-600 py-8 px-16 block shrink-0 text-center font-bold rounded hover:bg-fuchsia-300 transition-colors duration-200 md:h-40"
            >
              See my public profile
            </Link>
          </div>
          <div className="mb-32 md:bg-fuchsia-100 md:p-32 md:rounded-16">
            <TabsProvider defaultValue="post">
              <TabList className="flex flex-row flew-nowrap gap-x-8 mb-16 md:gap-x-16 md:justify-center md:mb-32">
                <Tab
                  value="post"
                  baseClass="p-8 w-full md:w-[125px] rounded-8"
                  activeClass="bg-fuchsia-200 text-fuchsia-900 font-bold"
                  inactiveClass="bg-transparent text-fuchsia-600 hover:bg-fuchsia-50 transition-colors duration-200"
                >
                  Post
                </Tab>
                <Tab
                  value="favorite"
                  baseClass="p-8 w-full md:w-[125px] rounded-8"
                  activeClass="bg-fuchsia-200 text-fuchsia-900 font-bold"
                  inactiveClass="bg-transparent text-fuchsia-600 hover:bg-fuchsia-50 transition-colors duration-200"
                >
                  Favorite
                </Tab>
                <Tab
                  value="account"
                  baseClass="p-8 w-full md:w-[125px] rounded-8"
                  activeClass="bg-fuchsia-200 text-fuchsia-900 font-bold"
                  inactiveClass="bg-transparent text-fuchsia-600 hover:bg-fuchsia-50 transition-colors duration-200"
                >
                  Account
                </Tab>
              </TabList>
              <TabPanel value="post">
                <ProfilePostList
                  posts={user.posts.map((post) => ({
                    id: post.id,
                    name: post.name,
                    image: post.images[0],
                  }))}
                  altText="You haven't created any posts yet."
                />
              </TabPanel>
              <TabPanel value="favorite">
                <ProfilePostList
                  isFavPost
                  posts={user.favPosts}
                  altText="Your favorite list is empty."
                />
              </TabPanel>
              <TabPanel
                value="account"
                className="md:w-[450px] md:bg-fuchsia-200 md:rounded-16 md:p-32 md:mx-auto"
              >
                <UpdateAccountForm
                  value="name"
                  setName={setName}
                  csrfToken={csrfToken}
                />
                <UpdateAccountForm value="email" csrfToken={csrfToken} />
                <UpdateAccountForm value="password" csrfToken={csrfToken} />
                <DeleteAccountModal />
              </TabPanel>
            </TabsProvider>
          </div>
        </div>
      </main>
    </>
  )
}

Profile.needAuth = true
