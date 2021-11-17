import { AppProps } from 'next/dist/shared/lib/router/router'
import 'bootstrap/dist/css/bootstrap.min.css'
import Link from 'next/link'
import Head from 'next/head'

const App = ({ Component, props }: AppProps) => (
  <>
    <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <header className="container-fluid d-flex justify-content-between align-items-center mb-4 p-2 shadow-sm">
      <h1 className="m-0">
        <Link href="/">
          <a className="text-decoration-none text-dark">Filanad</a>
        </Link>
      </h1>
      <div>
        <Link href="/">
          <a className="btn text-decoration-none text-dark fs-5">Log in</a>
        </Link>
        <Link href="/signup">
          <a className="ms-3 btn btn-primary border-3 fs-5">Sign up</a>
        </Link>
      </div>
    </header>
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
