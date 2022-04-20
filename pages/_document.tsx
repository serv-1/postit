import { Html, Head, Main, NextScript, DocumentProps } from 'next/document'

const Document = (props: DocumentProps) => {
  const pageProps = props?.__NEXT_DATA__?.props?.pageProps

  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className={pageProps?.background}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
