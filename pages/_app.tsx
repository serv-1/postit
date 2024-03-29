import { AppProps } from 'next/dist/shared/lib/router/router'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import AuthGuard from '../components/AuthGuard'
import { ComponentType, useEffect } from 'react'
import { ToastProvider } from '../contexts/toast'
import Toast from '../components/Toast'
import '../styles/globals.css'
import '../styles/popup.css'
import '../node_modules/leaflet/dist/leaflet.css'

export type PageType = ComponentType<{}> & {
  needAuth?: true
}

type NextAppProps = AppProps & { Component: PageType }

const App = ({ Component, pageProps }: NextAppProps) => {
  useEffect(() => {
    if (pageProps && pageProps.background) {
      document.body.className = pageProps.background
    } else {
      document.body.className = ''
    }
  })
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <ToastProvider>
          <div
            className={
              'relative mx-16 grid min-h-screen grid-rows-[auto_1fr_auto]'
            }
          >
            <Toast />
            {Component.needAuth ? (
              <AuthGuard>
                <Component {...pageProps} />
              </AuthGuard>
            ) : (
              <Component {...pageProps} />
            )}
            <footer className="text-s p-8">
              <p>
                Copyright © {new Date().getFullYear()} PostIt. All rights
                reserved.
              </p>
            </footer>
          </div>
        </ToastProvider>
      </SessionProvider>
    </>
  )
}
export default App
