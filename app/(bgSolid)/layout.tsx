import Header from 'components/Header'
import PageWrapper from 'components/PageWrapper'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <PageWrapper>
        <Header />
        {children}
      </PageWrapper>
    </body>
  )
}
