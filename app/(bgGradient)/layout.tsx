import Header from 'components/Header'
import PageWrapper from 'components/PageWrapper'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <body className="bg-linear-page">
      <PageWrapper>
        <div className="my-auto">
          <div className="max-w-[450px] md:max-w-none mx-auto">
            <Header />
          </div>
          {children}
        </div>
      </PageWrapper>
    </body>
  )
}
