import { GetStaticProps } from 'next'
import Head from 'next/head'
import Header from '../components/Header'
import SendCheck from '../public/static/images/send-check.svg'

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      background:
        'bg-[linear-gradient(160deg,#FAE8FF_33.90%,#F5D0FE_34%,#F5D0FE_48.90%,#D946EF_49%)]',
    },
  }
}

const MailSent = () => {
  return (
    <>
      <Head>
        <title>Mail sent! - Filanad</title>
      </Head>
      <div className="flex flex-col flex-nowrap justify-center items-center">
        <Header noMenu className="px-0 py-4" />
        <main className="w-full rounded-16 overflow-hidden md:flex md:flex-row md:flex-nowrap md:h-[486px]">
          <div className="p-32 bg-[rgba(253,244,255,0.6)] backdrop-blur-[4px] shadow-[-8px_8px_8px_rgba(112,26,117,0.05),inset_4px_-4px_8px_rgba(253,244,255,0.1),inset_-4px_4px_8px_rgba(253,244,255,0.2)] md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-[-8px_8px_8px_rgba(112,26,117,0.05)] md:basis-1/2">
            <SendCheck className="w-[160px] h-[160px] mx-auto mb-32 md:hidden" />
            <p className="text-m-l font-bold text-center md:text-left md:text-t-l md:relative md:top-1/2 md:-translate-y-1/2 lg:text-t-2xl">
              A mail should have been sent to your email address.
            </p>
          </div>
          <div className="hidden md:basis-1/2 md:flex md:justify-center md:items-center md:bg-[linear-gradient(210deg,#F0ABFC_12.5%,#E879F9_54%)]">
            <SendCheck className="w-[260px] h-[260px]" />
          </div>
        </main>
      </div>
    </>
  )
}

MailSent.need2RowsGrid = true

export default MailSent
