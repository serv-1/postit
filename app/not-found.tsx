import type { Metadata } from 'next'
import Layout from './(bgGradient)/layout'

export const metadata: Metadata = {
  title: 'Not Found - PostIt',
}

export default function NotFound() {
  return (
    <Layout>
      <main className="md:flex md:h-[486px] md:shadow-wrapper max-w-[450px] mx-auto md:max-w-none">
        <div className="rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass p-32 md:pr-8 md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-none md:rounded-r-none md:w-1/2">
          <div className="text-[128px] font-bold leading-[104px] mb-8 tracking-[.1em] text-center [text-shadow:2px_2px_0_#E879F9,4px_4px_0_#701A75] md:text-[64px] md:leading-[64px] md:mb-0 md:tracking-normal md:text-right md:[text-shadow:-2px_2px_0_#FDF4FF,-4px_4px_0_#A21CAF] md:relative md:top-1/2 md:-translate-y-1/2">
            404
          </div>
          <div className="text-m-l font-bold text-fuchsia-500 text-center md:hidden lg:text-t-2xl">
            Not Found
          </div>
        </div>
        <div className="hidden md:flex items-center bg-fuchsia-900 w-1/2 pl-8 rounded-r-16">
          <div className="text-[64px] leading-[64px] text-fuchsia-50 font-bold [text-shadow:2px_2px_0_#701A75,4px_4px_0_#F0ABFC]">
            Not Found
          </div>
        </div>
      </main>
    </Layout>
  )
}
