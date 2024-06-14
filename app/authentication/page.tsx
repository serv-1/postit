import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import SignUpForm from 'components/SignUpForm'
import SignInForm from 'components/SignInForm'
import SignInProviderButton from 'components/SignInProviderButton'
import Tab from 'components/Tab'
import TabList from 'components/TabList'
import TabPanel from 'components/TabPanel'
import TabsProvider from 'components/TabsProvider'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

const squareClasses =
  'rounded-16 w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24'

const roundClasses =
  'rounded-full w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24'

export const metadata: Metadata = {
  title: 'Authentication - PostIt',
}

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (session) {
    redirect('/profile')
  }

  return (
    <main className="h-[470px] md:h-[486px] mb-auto md:shadow-wrapper md:flex">
      <div className="h-full flex flex-col rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass p-32 md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-none md:w-1/2 md:rounded-r-none md:items-center">
        <h1 className="md:w-[350px]">Authentication</h1>
        <TabsProvider defaultValue="signIn">
          <TabList className="mt-16 mb-32 text-fuchsia-600 flex flex-row flex-nowrap gap-x-16 md:w-[350px]">
            <Tab
              value="signIn"
              activeClass="border-b-2 border-fuchsia-600 transition-colors duration-200"
            >
              Sign in
            </Tab>
            <Tab
              value="register"
              activeClass="border-b-2 border-fuchsia-600 transition-colors duration-200"
            >
              Register
            </Tab>
          </TabList>
          <TabPanel value="signIn" className="md:w-[350px]">
            <SignInForm />
            <div className="flex flex-row flex-nowrap items-center gap-x-4 font-bold text-center rounded-full my-16 before:block before:h-[1px] before:w-1/2 before:bg-fuchsia-900 after:block after:h-[1px] after:w-1/2 after:bg-fuchsia-900">
              Or
            </div>
            <SignInProviderButton id="google">
              Sign in with Google
            </SignInProviderButton>
          </TabPanel>
          <TabPanel value="register" className="md:w-[350px]">
            <SignUpForm />
          </TabPanel>
        </TabsProvider>
      </div>
      <div className="hidden md:flex justify-center items-center w-1/2 bg-linear-wrapper rounded-r-16">
        <div className="w-[300px] lg:w-[360px] aspect-square flex flex-wrap justify-between content-between">
          <div className={squareClasses}></div>
          <div className={roundClasses}></div>
          <div className={roundClasses}></div>
          <div className={squareClasses}></div>
        </div>
      </div>
    </main>
  )
}
