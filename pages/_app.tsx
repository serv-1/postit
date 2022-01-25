import { AppProps } from 'next/dist/shared/lib/router/router'
import 'bootstrap/dist/css/bootstrap.min.css'
import Head from 'next/head'
import Header from '../components/Header'
import { SessionProvider } from 'next-auth/react'
import AuthGuard from '../components/AuthGuard'
import { ComponentType } from 'react'
import { ToastProvider } from '../contexts/toast'
import { useEffect } from 'react'
import Toast from '../components/Toast'

export type PageType = ComponentType<{}> & {
  needAuth: boolean
}

type NextAppProps = AppProps & { Component: PageType }

const App = ({ Component, pageProps }: NextAppProps) => {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.min')
  }, [])
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <ToastProvider>
          <Header />
          <Toast />
          {Component.needAuth ? (
            <AuthGuard>
              <Component {...pageProps} />
            </AuthGuard>
          ) : (
            <Component {...pageProps} />
          )}
          <footer className="bg-dark p-2">
            <p className="text-light m-0">
              Copyright © {new Date().getFullYear()} Filanad, Inc. All rights
              reserved.
            </p>
          </footer>
        </ToastProvider>
      </SessionProvider>
    </>
  )
}
export default App
