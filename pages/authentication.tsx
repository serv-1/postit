import { GetServerSideProps } from 'next'
import { getProviders, getSession } from 'next-auth/react'
import Head from 'next/head'
import { useState } from 'react'
import AuthenticationForgotPassword from '../components/AuthenticationForgotPassword'
import AuthenticationRegisterForm from '../components/AuthenticationRegisterForm'
import AuthenticationSignInForm from '../components/AuthenticationSignInForm'
import { UnPromise } from '../types/common'
import { TabsProvider } from '../contexts/tabs'
import Tab from '../components/Tab'
import TabList from '../components/TabList'
import TabPanel from '../components/TabPanel'
import GlassWrapper from '../components/GlassWrapper'
import RightPanel from '../components/RightPanel'
import LeftPanel from '../components/LeftPanel'
import Link from '../components/Link'

const squareClasses =
  'rounded-16 w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24'

const roundClasses =
  'rounded-full w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  if (session) {
    return { redirect: { permanent: false, destination: '/403' } }
  }

  return {
    props: { providers: await getProviders(), background: 'bg-linear-page' },
  }
}

interface AuthenticationProps {
  providers: UnPromise<ReturnType<typeof getProviders>>
}

const Authentication = ({ providers }: AuthenticationProps) => {
  const [forgotPassword, setForgotPassword] = useState(false)
  return (
    <>
      <Head>
        <title>Authentication - PostIt</title>
      </Head>
      <main className="flex flex-col justify-center items-center row-span-2">
        <Link
          href="/"
          className="font-bold text-m-xl md:text-t-xl hover:text-fuchsia-600 transition-colors duration-200 p-16"
        >
          PostIt
        </Link>
        <GlassWrapper minHeight="min-h-[470px] md:min-h-[486px]">
          <LeftPanel>
            <div className="h-full flex flex-col md:max-w-[350px] md:mx-auto">
              {forgotPassword ? (
                <AuthenticationForgotPassword
                  setForgotPassword={setForgotPassword}
                />
              ) : (
                <>
                  <h1>Authentication</h1>
                  <TabsProvider defaultValue="signIn">
                    <TabList className="mt-16 mb-32 text-fuchsia-600 flex flex-row flex-nowrap gap-x-16">
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
                    <TabPanel value="signIn">
                      <AuthenticationSignInForm
                        providers={providers}
                        setForgotPassword={setForgotPassword}
                      />
                    </TabPanel>
                    <TabPanel value="register">
                      <AuthenticationRegisterForm />
                    </TabPanel>
                  </TabsProvider>
                </>
              )}
            </div>
          </LeftPanel>
          <RightPanel>
            <div className="flex flex-row flex-wrap gap-[60px] justify-center w-[300px] lg:w-[360px] lg:gap-[80px]">
              <div className={squareClasses}></div>
              <div className={roundClasses}></div>
              <div className={roundClasses}></div>
              <div className={squareClasses}></div>
            </div>
          </RightPanel>
        </GlassWrapper>
      </main>
    </>
  )
}

export default Authentication
