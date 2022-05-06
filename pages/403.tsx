import { GetStaticProps } from 'next'
import Head from 'next/head'
import Header from '../components/Header'

export const getStaticProps: GetStaticProps = async () => ({
  props: { background: 'bg-linear-page' },
})

const Page403 = () => (
  <>
    <Head>
      <title>Forbidden - Filanad</title>
    </Head>
    <div className="flex flex-col flex-nowrap justify-center items-center">
      <Header noMenu className="px-0 py-4" />
      <main className="w-full rounded-16 overflow-hidden md:flex md:flex-row md:flex-nowrap md:h-[486px]">
        <div className="p-32 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-wrapper md:basis-1/2 md:pr-8">
          <div className="text-[128px] font-bold leading-[104px] mb-8 tracking-[.1em] text-center [text-shadow:2px_2px_0_#E879F9,4px_4px_0_#701A75] md:text-[64px] md:leading-[64px] md:mb-0 md:tracking-normal md:text-right md:[text-shadow:-2px_2px_0_#FDF4FF,-4px_4px_0_#A21CAF] md:relative md:top-1/2 md:-translate-y-1/2">
            403
          </div>
          <div className="text-m-l font-bold text-fuchsia-500 text-center md:hidden lg:text-t-2xl">
            Forbidden
          </div>
        </div>
        <div className="hidden md:basis-1/2 md:flex md:items-center md:bg-fuchsia-900 md:pl-8">
          <div className="text-[64px] leading-[64px] text-fuchsia-50 font-bold [text-shadow:2px_2px_0_#701A75,4px_4px_0_#F0ABFC]">
            Forbidden
          </div>
        </div>
      </main>
    </div>
  </>
)

Page403.need2RowsGrid = true

export default Page403
