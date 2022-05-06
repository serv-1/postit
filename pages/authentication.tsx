import { GetServerSideProps } from 'next'
import { getProviders, getSession } from 'next-auth/react'
import Head from 'next/head'
import { useState } from 'react'
import AuthenticationForgotPassword from '../components/AuthenticationForgotPassword'
import AuthenticationRegisterForm from '../components/AuthenticationRegisterForm'
import AuthenticationSignInForm from '../components/AuthenticationSignInForm'
import Header from '../components/Header'
import { UnPromise } from '../types/common'
import { TabsProvider } from '../contexts/tabs'
import Tab from '../components/Tab'
import TabList from '../components/TabList'
import TabPanel from '../components/TabPanel'

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
        <title>Authentication - Filanad</title>
      </Head>
      <div className="flex flex-col flex-nowrap justify-center items-center">
        <Header noMenu className="px-0 py-4" />
        <main className="w-full rounded-16 min-h-[470px] overflow-hidden md:min-h-[486px] md:flex md:flex-row md:flex-nowrap">
          <div className="flex justify-center h-full p-32 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-wrapper md:basis-1/2">
            <div className="flex flex-col flex-nowrap h-full basis-[350px]">
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
          </div>
          <div className="hidden md:basis-1/2 md:flex md:justify-center md:items-center md:bg-linear-wrapper">
            <div className="flex flex-row flex-wrap gap-[60px] justify-center w-[300px] lg:w-[360px] lg:gap-[80px]">
              <div className="rounded-16 w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
              <div className="rounded-full w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
              <div className="rounded-full w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
              <div className="rounded-16 w-[120px] h-[120px] bg-fuchsia-200 shadow-shape relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

Authentication.need2RowsGrid = true

export default Authentication
