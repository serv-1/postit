import Head from 'next/head'

const Page404 = () => (
  <>
    <Head>
      <title>Not found - Filanad</title>
    </Head>
    <main className="py-32 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-16 justify-center flex-grow">
      <div className="col-span-full text-center font-bold my-auto">
        <div className="text-indigo-600 text-[72px] leading-[72px]">404</div>
        <div className="text-[48px] leading-[48px]">Not Found</div>
      </div>
    </main>
  </>
)

export default Page404
