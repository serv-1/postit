import GlassWrapper from 'components/GlassWrapper'
import Header from 'components/Header'
import LeftPanel from 'components/LeftPanel'
import PageWrapper from 'components/PageWrapper'
import RightPanel from 'components/RightPanel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Not Found - PostIt',
}

export default function Page() {
  return (
    <PageWrapper hasGradient>
      <div className="my-auto">
        <div className="max-w-[450px] mx-auto md:max-w-none">
          <Header />
        </div>
        <main className="flex justify-center">
          <GlassWrapper minHeight="md:min-h-[480px]">
            <LeftPanel padding="md:py-32 md:pl-32 md:pr-8">
              <div className="text-[128px] font-bold leading-[104px] mb-8 tracking-[.1em] text-center [text-shadow:2px_2px_0_#E879F9,4px_4px_0_#701A75] md:text-[64px] md:leading-[64px] md:mb-0 md:tracking-normal md:text-right md:[text-shadow:-2px_2px_0_#FDF4FF,-4px_4px_0_#A21CAF] md:relative md:top-1/2 md:-translate-y-1/2">
                404
              </div>
              <div className="text-m-l font-bold text-fuchsia-500 text-center md:hidden lg:text-t-2xl">
                Not Found
              </div>
            </LeftPanel>
            <RightPanel errorPage>
              <div className="text-[64px] leading-[64px] text-fuchsia-50 font-bold [text-shadow:2px_2px_0_#701A75,4px_4px_0_#F0ABFC]">
                Not Found
              </div>
            </RightPanel>
          </GlassWrapper>
        </main>
      </div>
    </PageWrapper>
  )
}
