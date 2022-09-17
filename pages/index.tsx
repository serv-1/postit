import Head from 'next/head'
import HomeSearchPosts from '../components/HomeSearchPosts'
import HomePostPage from '../components/HomePostPage'
import Header from '../components/Header'

const Home = () => {
  return (
    <>
      <Head>
        <title>Home - PostIt</title>
      </Head>
      <Header />
      <main className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid-rows-[auto_1fr] gap-x-24">
        <div className="col-span-full lg:col-span-4 bg-linear-search p-16 rounded-16 shadow-[-4px_4px_8px_#F5D0FE] lg:sticky lg:top-16">
          <h1 className="mb-16">Search</h1>
          <HomeSearchPosts />
        </div>
        <HomePostPage />
      </main>
    </>
  )
}

export default Home
