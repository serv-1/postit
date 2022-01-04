import Head from 'next/head'

const Page404 = () => (
  <>
    <Head>
      <title>Filanad - Not found</title>
    </Head>
    <main className="w-50 m-auto my-4 p-4 shadow border border-danger border-2 rounded text-center">
      <div style={{ fontSize: '5rem' }}>¯\_(ツ)_/¯</div>
      <h1>
        <span className="text-danger">404</span> - Not found
      </h1>
    </main>
  </>
)

export default Page404
