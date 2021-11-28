import { AppProps } from 'next/dist/shared/lib/router/router'
import 'bootstrap/dist/css/bootstrap.min.css'
import Head from 'next/head'
import Header from '../components/header'

const App = ({ Component, props }: AppProps) => (
  <>
    <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Header />
    <main className="w-75 m-auto shadow rounded">
      <Component {...props} />
    </main>
    <footer className="bg-dark mt-4 p-2">
      <p className="text-light m-0">
        Copyright © {new Date().getFullYear()} Filanad, Inc. All rights
        reserved.
      </p>
    </footer>
  </>
)

export default App
