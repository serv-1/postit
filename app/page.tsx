import type { Metadata } from 'next'
import PageWrapper from 'components/PageWrapper'
import Header from 'components/Header'
import HomeSearchPosts from 'components/HomeSearchPosts'
import HomePostPage from 'components/HomePostPage'

export const metadata: Metadata = {
  title: 'Home - PostIt',
}

export default function Page() {
  return (
    <PageWrapper>
      <Header />
      <main className="grow flex flex-col mb-32 lg:flex-row lg:items-start lg:gap-x-24">
        <div className="bg-linear-search p-16 rounded-16 shadow-[-4px_4px_8px_#F5D0FE] lg:sticky lg:top-16 mb-32 lg:w-[384px] lg:shrink-0">
          <h1 className="mb-16">Search</h1>
          <HomeSearchPosts />
        </div>
        <HomePostPage />
      </main>
    </PageWrapper>
  )
}
