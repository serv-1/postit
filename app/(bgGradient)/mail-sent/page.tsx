import SendCheck from 'public/static/images/send-check.svg'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mail Sent - PostIt',
}

export default function Page() {
  return (
    <main className="md:flex md:h-[486px] md:shadow-wrapper max-w-[450px] mx-auto md:max-w-none">
      <div className="rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass p-32 md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-none md:rounded-r-none md:w-1/2">
        <SendCheck className="w-[160px] h-[160px] mx-auto mb-32 md:hidden" />
        <p className="text-m-l font-bold text-center md:text-left md:text-t-l md:relative md:top-1/2 md:-translate-y-1/2 lg:text-t-2xl">
          A mail should have been sent to your email address.
        </p>
      </div>
      <div className="hidden md:flex justify-center items-center bg-linear-wrapper w-1/2 rounded-r-16">
        <SendCheck className="w-[260px] h-[260px]" />
      </div>
    </main>
  )
}
