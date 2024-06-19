import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import getUser from 'functions/getUser'
import getPosts from 'functions/getPosts'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import { POST_NOT_FOUND, USER_NOT_FOUND } from 'constants/errors'
import ProfileUserImage from 'components/ProfileUserImage'
import TabsProvider from 'components/TabsProvider'
import TabList from 'components/TabList'
import Tab from 'components/Tab'
import TabPanel from 'components/TabPanel'
import ProfilePostList from 'components/ProfilePostList'
import DeleteAccountModal from 'components/DeleteAccountModal'
import SignOut from 'public/static/images/sign-out.svg'
import SignOutButton from 'components/SignOutButton'
import ProfileUserName from 'components/ProfileUserName'
import PublicProfileLink from 'components/PublicProfileLink'
import UpdateUserNameForm from 'components/UpdateUserNameForm'
import UpdateUserEmailForm from 'components/UpdateUserEmailForm'
import UpdateUserPasswordForm from 'components/UpdateUserPasswordForm'

export const metadata: Metadata = {
  title: 'Your Profile - PostIt',
}

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    redirect('/authentication')
  }

  const user = await getUser(session.id)

  if (!user) {
    throw new Error(USER_NOT_FOUND)
  }

  const posts = await getPosts(user.postIds)

  if (!posts) {
    throw new Error(POST_NOT_FOUND)
  }

  const favPosts = await getPosts(user.favPostIds)

  if (!favPosts) {
    throw new Error(POST_NOT_FOUND)
  }

  return (
    <main className="grow flex flex-col gap-x-24">
      <div className="mb-32 p-8 md:flex md:flex-row md:flex-nowrap md:items-center md:bg-fuchsia-100 md:rounded-16 md:p-16">
        <div className="flex-grow flex flex-row flex-nowrap items-center min-w-0 mb-8 md:mb-0 md:mr-16">
          <ProfileUserImage image={user.image} />
          <ProfileUserName name={user.name} />
          <SignOutButton className="text-fuchsia-600 hover:text-fuchsia-900 transition-colors duration-200">
            <SignOut className="w-32 h-32" />
          </SignOutButton>
        </div>
        <PublicProfileLink id={user.id} name={user.name} />
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
              type="default"
              posts={posts}
              placeholder="You haven't created any posts yet."
            />
          </TabPanel>
          <TabPanel value="favorite">
            <ProfilePostList
              type="favorite"
              posts={favPosts}
              placeholder="Your favorite list is empty."
            />
          </TabPanel>
          <TabPanel
            value="account"
            className="md:w-[450px] md:bg-fuchsia-200 md:rounded-16 md:p-32 md:mx-auto"
          >
            <UpdateUserNameForm />
            <UpdateUserEmailForm />
            <UpdateUserPasswordForm />
            <DeleteAccountModal />
          </TabPanel>
        </TabsProvider>
      </div>
    </main>
  )
}
