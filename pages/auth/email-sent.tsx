import Head from 'next/head'
import SendCheck from '../../public/static/images/send-check.svg'

const EmailSent = () => {
  return (
    <>
      <Head>
        <title>Filanad - Email sent!</title>
      </Head>
      <main
        data-cy="email-sent"
        className="w-50 m-auto p-4 shadow border border-success border-2 rounded text-center"
      >
        <div
          className="rounded-circle d-inline-block mb-4"
          style={{ backgroundColor: '#cfe' }}
        >
          <SendCheck className="text-success" width="200" height="200" />
        </div>
        <h1>An email should have been sent.</h1>
        <p>
          An email should have been sent to your email address with a link that
          will connect you once clicked. Don&apos;t forget to check your spam if
          you don&apos;t see it or you can just wait until it arrives.
        </p>
      </main>
    </>
  )
}

export default EmailSent
