import Head from 'next/head'
import SendCheck from '../../public/static/images/send-check.svg'

const MailSent = () => {
  return (
    <>
      <Head>
        <title>Filanad - Mail sent!</title>
      </Head>
      <main
        data-cy="mailSent"
        className="py-32 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-16 justify-center m-auto"
      >
        <div className="col-start-2 md:col-start-4 lg:col-start-6 col-span-2 mb-16 relative">
          <div className="w-full h-full bg-indigo-200 rounded-full absolute top-0 start-0 z-[-1]"></div>
          <SendCheck className="text-indigo-600 w-full h-full" />
        </div>
        <h1 className="col-span-full text-4xl md:text-4xl lg:text-4xl font-bold text-center">
          A mail should have been sent.
        </h1>
      </main>
    </>
  )
}

export default MailSent
