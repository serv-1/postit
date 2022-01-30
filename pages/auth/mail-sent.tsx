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
        className="w-50 m-auto my-4 p-4 shadow border border-success border-2 rounded text-center"
      >
        <div
          className="rounded-circle d-inline-block mb-4"
          style={{ backgroundColor: '#cfe' }}
        >
          <SendCheck className="text-success" width="200" height="200" />
        </div>
        <h1>A mail should have been sent.</h1>
        <p>
          A mail should have been sent to your email address with a link that
          will connect you once clicked. Don&apos;t forget to check your spam if
          you don&apos;t see it or you can just wait until it arrives.
        </p>
      </main>
    </>
  )
}

export default MailSent
