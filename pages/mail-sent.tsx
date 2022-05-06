import { GetStaticProps } from 'next'
import Head from 'next/head'
import Header from '../components/Header'
import SendCheck from '../public/static/images/send-check.svg'

export const getStaticProps: GetStaticProps = async () => ({
  props: { background: 'bg-linear-page' },
})

const MailSent = () => {
  return (
    <>
      <Head>
        <title>Mail sent! - Filanad</title>
      </Head>
      <div className="flex flex-col flex-nowrap justify-center items-center">
        <Header noMenu className="px-0 py-4" />
        <main className="w-full rounded-16 overflow-hidden md:flex md:flex-row md:flex-nowrap md:h-[486px]">
          <div className="p-32 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-wrapper md:basis-1/2">
            <SendCheck className="w-[160px] h-[160px] mx-auto mb-32 md:hidden" />
            <p className="text-m-l font-bold text-center md:text-left md:text-t-l md:relative md:top-1/2 md:-translate-y-1/2 lg:text-t-2xl">
              A mail should have been sent to your email address.
            </p>
          </div>
          <div className="hidden md:basis-1/2 md:flex md:justify-center md:items-center md:bg-linear-wrapper">
            <SendCheck className="w-[260px] h-[260px]" />
          </div>
        </main>
      </div>
    </>
  )
}

MailSent.need2RowsGrid = true

export default MailSent
