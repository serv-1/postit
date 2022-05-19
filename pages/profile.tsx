import ProfileUserImage from '../components/ProfileUserImage'
import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { IUser } from '../types/common'
import Head from 'next/head'
import Header from '../components/Header'
import Link from '../components/Link'
import SignOut from '../public/static/images/sign-out.svg'
import { TabsProvider } from '../contexts/tabs'
import TabList from '../components/TabList'
import Tab from '../components/Tab'
import TabPanel from '../components/TabPanel'
import UpdateAccountForm from '../components/UpdateAccountForm'
import DeleteAccountModal from '../components/DeleteAccountModal'
import ProfilePostList from '../components/ProfilePostList'
import formatToUrl from '../utils/functions/formatToUrl'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  if (!session) {
    return { redirect: { permanent: false, destination: '/auth/sign-in' } }
  }

  try {
    const { id } = session
    const res = await axios.get<IUser>(`http://localhost:3000/api/users/${id}`)
    return { props: { user: res.data } }
  } catch (e) {
    return { notFound: true }
  }
}

interface ProfileProps {
  user: IUser
}

const Profile = ({ user }: ProfileProps) => {
  return (
    <>
      <Head>
        <title>Profile - Filanad</title>
      </Head>
      <Header>
        <Link
          href="/create-a-post"
          className="bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold mr-8 md:mr-16"
        >
          Create a post
        </Link>
      </Header>
      <main
        data-cy="profile"
        className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-24"
      >
        <div className="col-span-full">
          <div className="mb-32 p-8 md:flex md:flex-row md:flex-nowrap md:justify-between md:items-center md:bg-fuchsia-100 md:rounded-16 md:p-16">
            <div className="flex flex-row flex-nowrap mb-8">
              <ProfileUserImage image={user.image} />
              <div className="flex-grow flex flex-row flew-nowrap justify-between items-center md:gap-x-16">
                <h1>{user.name}</h1>
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
            </div>
            <Link
              href={`/users/${user.id}/${formatToUrl(user.name)}`}
              className="bg-fuchsia-200 text-fuchsia-600 py-8 px-16 block w-full text-center font-bold rounded hover:bg-fuchsia-300 transition-colors duration-200 md:w-auto md:h-40"
            >
              See my public profile
            </Link>
          </div>
          <div className="mb-32 md:bg-fuchsia-100 md:p-32 md:rounded-16">
            <TabsProvider defaultValue="post">
              <TabList className="flex flex-row flew-nowrap mb-16 md:justify-center md:mb-32">
                <Tab
                  value="post"
                  baseClass="p-8 w-full font-bold md:w-[150px] rounded-l-full"
                  activeClass="bg-fuchsia-400 text-fuchsia-900"
                  inactiveClass="bg-fuchsia-200 text-fuchsia-400 hover:bg-fuchsia-400 hover:text-fuchsia-900 transition-colors duration-200"
                >
                  Post
                </Tab>
                <Tab
                  value="favorite"
                  baseClass="p-8 w-full font-bold md:w-[150px]"
                  activeClass="bg-fuchsia-400 text-fuchsia-900"
                  inactiveClass="bg-fuchsia-200 text-fuchsia-400 hover:bg-fuchsia-400 hover:text-fuchsia-900 transition-colors duration-200"
                >
                  Favorite
                </Tab>
                <Tab
                  value="account"
                  baseClass="p-8 w-full font-bold md:w-[150px] rounded-r-full"
                  activeClass="bg-fuchsia-400 text-fuchsia-900"
                  inactiveClass="bg-fuchsia-200 text-fuchsia-400 hover:bg-fuchsia-400 hover:text-fuchsia-900 transition-colors duration-200"
                >
                  Account
                </Tab>
              </TabList>
              <TabPanel value="post">
                <ProfilePostList
                  posts={user.posts}
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
                <UpdateAccountForm value="name" />
                <UpdateAccountForm value="email" />
                <UpdateAccountForm value="password" />
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

export default Profile
