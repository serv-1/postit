import { GetServerSideProps } from 'next'
import { getProviders, getSession } from 'next-auth/react'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import AuthenticationForgotPassword from '../components/AuthenticationForgotPassword'
import AuthenticationRegisterForm from '../components/AuthenticationRegisterForm'
import AuthenticationSignInForm from '../components/AuthenticationSignInForm'
import Header from '../components/Header'
import { UnPromise } from '../types/common'

type AuthActionState = 'sign-in' | 'register' | 'forgot-password'

const titles = {
  'sign-in': 'Sign in',
  register: 'Register',
  'forgot-password': 'Forgot password',
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  if (session) {
    return { redirect: { permanent: false, destination: '/403' } }
  }

  return {
    props: {
      providers: await getProviders(),
      background:
        'bg-[linear-gradient(160deg,#FAE8FF_33.90%,#F5D0FE_34%,#F5D0FE_48.90%,#D946EF_49%)]',
    },
  }
}

interface AuthenticationProps {
  providers: UnPromise<ReturnType<typeof getProviders>>
}

const Authentication = ({ providers }: AuthenticationProps) => {
  const [authAction, setAuthAction] = useState<AuthActionState>('sign-in')

  useEffect(() => {
    const onHashChange = () => {
      setAuthAction(window.location.hash.slice(1) as AuthActionState)
    }
    window.addEventListener('onHashChange', onHashChange)
    return () => window.removeEventListener('onHashChange', onHashChange)
  }, [])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash || !Object.keys(titles).includes(hash)) return
    setAuthAction(hash as AuthActionState)
  }, [])

  let currentTab = authAction === 'register' ? 1 : 0

  return (
    <>
      <Head>
        <title>{titles[authAction]} - Filanad</title>
      </Head>
      <div className="flex flex-col flex-nowrap justify-center items-center">
        <Header noMenu className="px-0 py-4" />
        <main className="w-full rounded-16 min-h-[470px] overflow-hidden md:min-h-[486px] md:flex md:flex-row md:flex-nowrap">
          <div className="flex justify-center h-full p-32 bg-[rgba(253,244,255,0.6)] backdrop-blur-[4px] shadow-[-8px_8px_8px_rgba(112,26,117,0.05),inset_4px_-4px_8px_rgba(253,244,255,0.1),inset_-4px_4px_8px_rgba(253,244,255,0.2)] md:bg-fuchsia-50 md:shadow-[-8px_8px_8px_rgba(112,26,117,0.05)] md:basis-1/2">
            <div className="flex flex-col flex-nowrap h-full basis-[350px]">
              {authAction === 'forgot-password' ? (
                <AuthenticationForgotPassword />
              ) : (
                <>
                  <h1>Authentication</h1>
                  <div
                    role="tablist"
                    className="mt-16 mb-32 text-fuchsia-600 flex flex-row flex-nowrap gap-x-16"
                    onKeyDown={(e) => {
                      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')
                        return

                      const tabs = (e.currentTarget as HTMLDivElement).children

                      tabs[currentTab].setAttribute('tabindex', '-1')

                      if (e.key === 'ArrowLeft') {
                        currentTab--
                        if (currentTab < 0) currentTab = tabs.length - 1
                      } else {
                        currentTab++
                        if (currentTab >= tabs.length) currentTab = 0
                      }

                      tabs[currentTab].setAttribute('tabindex', '0')
                      ;(tabs[currentTab] as HTMLButtonElement).focus()
                    }}
                  >
                    {(['sign-in', 'register'] as const).map((value) => (
                      <button
                        role="tab"
                        tabIndex={value === authAction ? 0 : -1}
                        aria-selected={value === authAction}
                        aria-controls={value + '-panel'}
                        id={value + '-tab'}
                        key={value}
                        className={
                          value === authAction
                            ? 'border-b-2 border-fuchsia-600 transition-colors duration-200'
                            : ''
                        }
                        onClick={() => {
                          window.location.hash = value
                          window.dispatchEvent(new CustomEvent('onHashChange'))
                        }}
                      >
                        {titles[value]}
                      </button>
                    ))}
                  </div>
                  <div
                    role="tabpanel"
                    id={authAction + '-panel'}
                    tabIndex={0}
                    aria-labelledby={authAction + '-tab'}
                  >
                    {authAction === 'sign-in' ? (
                      <AuthenticationSignInForm providers={providers} />
                    ) : (
                      <AuthenticationRegisterForm />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:basis-1/2 md:flex md:justify-center md:items-center md:bg-[linear-gradient(210deg,#F0ABFC_12.5%,#E879F9_54%)]">
            <div className="flex flex-row flex-wrap gap-[60px] justify-center w-[300px] lg:w-[360px] lg:gap-[80px]">
              <div className="rounded-16 w-[120px] h-[120px] bg-fuchsia-200 shadow-[-8px_8px_0_rgba(217,70,239,0.75),-16px_16px_0_rgba(112,26,117,0.75),inset_-2px_2px_4px_rgba(250,232,255,0.3),inset_4px_-4px_8px_rgba(112,26,117,0.3)] relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
              <div className="rounded-full w-[120px] h-[120px] bg-fuchsia-200 shadow-[-8px_8px_0_rgba(217,70,239,0.75),-16px_16px_0_rgba(112,26,117,0.75),inset_-2px_2px_4px_rgba(250,232,255,0.3),inset_4px_-4px_8px_rgba(112,26,117,0.3)] relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
              <div className="rounded-full w-[120px] h-[120px] bg-fuchsia-200 shadow-[-8px_8px_0_rgba(217,70,239,0.75),-16px_16px_0_rgba(112,26,117,0.75),inset_-2px_2px_4px_rgba(250,232,255,0.3),inset_4px_-4px_8px_rgba(112,26,117,0.3)] relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
              <div className="rounded-16 w-[120px] h-[120px] bg-fuchsia-200 shadow-[-8px_8px_0_rgba(217,70,239,0.75),-16px_16px_0_rgba(112,26,117,0.75),inset_-2px_2px_4px_rgba(250,232,255,0.3),inset_4px_-4px_8px_rgba(112,26,117,0.3)] relative top-0 left-0 hover:top-16 hover:-left-16 hover:shadow-none transition-[top,left,box-shadow] duration-500 lg:w-[140px] lg:h-[140px] lg:shadow-[-12px_12px_0_rgba(217,70,239,0.75),_-24px_24px_0_rgba(112,26,117,0.75),inset_-4px_4px_8px_rgba(250,232,255,0.3),inset_8px_-8px_16px_rgba(112,26,117,0.3)] lg:hover:top-24 lg:hover:-left-24"></div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

Authentication.need2RowsGrid = true

export default Authentication
