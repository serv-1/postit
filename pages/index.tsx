import Head from 'next/head'
import { useState } from 'react'
import HomeSearchPosts from '../components/HomeSearchPosts'
import HomePostsPage from '../components/HomePostsPage'
import { Post } from '../types/common'
import Particles from 'react-tsparticles'
import HomePostsFoundNumber from '../components/HomePostsFoundNumber'
import Pagination from '../components/Pagination'

const Home = () => {
  const [posts, setPosts] = useState<Post[]>()
  const [totalPosts, setTotalPosts] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)

  return (
    <>
      <Head>
        <title>Filanad - Home</title>
      </Head>
      <main data-cy="home">
        <div className="container-fluid py-4 mb-4 position-relative">
          <Particles
            className="position-absolute top-0 start-0 w-100 h-100"
            loaded={async (container) => {
              const style = container.canvas.element?.style
              if (style) style.position = 'absolute'
            }}
            options={{
              autoPlay: true,
              background: { color: { value: '#000423' } },
              fpsLimit: 60,
              particles: {
                color: { value: ['#5669FF', '#001CEF', '#0014AB'] },
                move: { enable: true },
                number: {
                  density: { enable: true, area: 400 },
                  value: 20,
                },
                shape: { type: 'circle' },
                size: { value: 30 },
              },
              pauseOnBlur: true,
              pauseOnOutsideViewport: true,
            }}
          />
          <HomeSearchPosts
            setPosts={setPosts}
            setTotalPages={setTotalPages}
            setTotalPosts={setTotalPosts}
            currentPage={currentPage}
          />
        </div>
        <div className="container-fluid mb-4">
          <div className="row justify-content-center position-relative">
            <div className="col-md-8">
              <HomePostsFoundNumber totalPosts={totalPosts} />
              <Pagination
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
              />
            </div>
          </div>
          <div className="row py-4 justify-content-center">
            <HomePostsPage posts={posts} />
          </div>
          <div className="row">
            <Pagination
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
      </main>
    </>
  )
}

export default Home
