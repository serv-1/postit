import Head from 'next/head'
import HomeSearchPosts from '../components/HomeSearchPosts'
import Particles from 'react-tsparticles'
import HomePosts from '../components/HomePosts'

const Home = () => {
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
          <HomeSearchPosts />
        </div>
        <div className="container-fluid mb-4">
          <HomePosts />
        </div>
      </main>
    </>
  )
}

export default Home
