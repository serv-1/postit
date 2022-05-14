import { GetStaticProps } from 'next'
import Head from 'next/head'
import GlassWrapper from '../components/GlassWrapper'
import Header from '../components/Header'
import LeftPanel from '../components/LeftPanel'
import RightPanel from '../components/RightPanel'
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
        <GlassWrapper minHeight="md:min-h-[480px]">
          <LeftPanel>
            <SendCheck className="w-[160px] h-[160px] mx-auto mb-32 md:hidden" />
            <p className="text-m-l font-bold text-center md:text-left md:text-t-l md:relative md:top-1/2 md:-translate-y-1/2 lg:text-t-2xl">
              A mail should have been sent to your email address.
            </p>
          </LeftPanel>
          <RightPanel>
            <SendCheck className="w-[260px] h-[260px] m-32" />
          </RightPanel>
        </GlassWrapper>
      </div>
    </>
  )
}

MailSent.need2RowsGrid = true

export default MailSent
