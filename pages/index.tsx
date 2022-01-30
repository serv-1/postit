import Head from 'next/head'
import { useState } from 'react'
import HomeSearchPosts from '../components/HomeSearchPosts'
import { IPost } from '../models/Post'

const Home = () => {
  const [posts, setPosts] = useState<IPost[]>()

  return (
    <>
      <Head>
        <title>Filanad - Home</title>
      </Head>
      <main>
        <HomeSearchPosts setPosts={setPosts} />
      </main>
    </>
  )
}

export default Home
