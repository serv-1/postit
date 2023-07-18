import { GetStaticProps } from 'next'
import Head from 'next/head'
import GlassWrapper from '../components/GlassWrapper'
import Header from '../components/Header'
import LeftPanel from '../components/LeftPanel'
import RightPanel from '../components/RightPanel'

export const getStaticProps: GetStaticProps = async () => ({
  props: { background: 'bg-linear-page' },
})

const Page403 = () => (
  <>
    <Head>
      <title>Forbidden - PostIt</title>
    </Head>
    <main className="flex flex-col justify-center items-center row-span-2">
      <div className="w-full max-w-[450px] md:max-w-none">
        <Header />
      </div>
      <GlassWrapper minHeight="md:min-h-[480px]">
        <LeftPanel padding="md:py-32 md:pl-32 md:pr-8">
          <div className="text-[128px] font-bold leading-[104px] mb-8 tracking-[.1em] text-center [text-shadow:2px_2px_0_#E879F9,4px_4px_0_#701A75] md:text-[64px] md:leading-[64px] md:mb-0 md:tracking-normal md:text-right md:[text-shadow:-2px_2px_0_#FDF4FF,-4px_4px_0_#A21CAF] md:relative md:top-1/2 md:-translate-y-1/2">
            403
          </div>
          <div className="text-m-l font-bold text-fuchsia-500 text-center md:hidden lg:text-t-2xl">
            Forbidden
          </div>
        </LeftPanel>
        <RightPanel errorPage>
          <div className="text-[64px] leading-[64px] text-fuchsia-50 font-bold [text-shadow:2px_2px_0_#701A75,4px_4px_0_#F0ABFC]">
            Forbidden
          </div>
        </RightPanel>
      </GlassWrapper>
    </main>
  </>
)

export default Page403
