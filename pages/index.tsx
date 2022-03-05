import Head from 'next/head'
import HomeSearchPosts from '../components/HomeSearchPosts'
import HomePostPage from '../components/HomePostPage'

const Home = () => {
  return (
    <>
      <Head>
        <title>Filanad - Home</title>
      </Head>
      <main data-cy="home" className="py-32 flex-grow flex flex-col">
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-16 justify-center">
          <h1 className="text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16 col-span-full">
            Search posts
          </h1>
          <HomeSearchPosts />
        </div>
        <div className="my-auto grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-16 justify-center">
          <HomePostPage />
        </div>
      </main>
    </>
  )
}

export default Home
