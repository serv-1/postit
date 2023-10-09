import GlassWrapper from 'components/GlassWrapper'
import Header from 'components/Header'
import LeftPanel from 'components/LeftPanel'
import PageWrapper from 'components/PageWrapper'
import RightPanel from 'components/RightPanel'
import SendCheck from 'public/static/images/send-check.svg'

export default function MailSent() {
  return (
    <PageWrapper hasGradient>
      <div className="my-auto">
        <div className="max-w-[450px] md:max-w-none mx-auto">
          <Header />
        </div>
        <main className="flex justify-center">
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
        </main>
      </div>
    </PageWrapper>
  )
}
