'use client'

import GlassWrapper from 'components/GlassWrapper'
import Header from 'components/Header'
import LeftPanel from 'components/LeftPanel'
import RightPanel from 'components/RightPanel'
import useLinearBackgroundGradient from 'hooks/useLinearBackgroundGradient'
import SendCheck from 'public/static/images/send-check.svg'

export default function MailSent() {
  useLinearBackgroundGradient()

  return (
    <main className="flex flex-col justify-center items-center row-span-2">
      <div className="w-full max-w-[450px] md:max-w-none">
        <Header />
      </div>
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
  )
}
