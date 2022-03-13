import Head from 'next/head'

const Page403 = () => (
  <>
    <Head>
      <title>Forbidden - Filanad</title>
    </Head>
    <main className="py-32 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-16 justify-center flex-grow">
      <div className="col-span-full text-center font-bold my-auto">
        <div className="text-indigo-600 text-[72px] leading-[72px]">403</div>
        <div className="text-[48px] leading-[48px]">Forbidden</div>
      </div>
    </main>
  </>
)

export default Page403
