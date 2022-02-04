import { Post } from '../types/common'
import PostsPagePost from './PostsPagePost'

export interface HomePostsPageProps {
  posts?: Post[]
}

const HomePostsPage = ({ posts }: HomePostsPageProps) => {
  const statusText = !posts ? 'Search something ☝' : 'No posts found 😳'

  return (
    <div className="col-md-8">
      <div className="row g-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div className="col-md-3" key={post.id}>
              <PostsPagePost
                id={post.id}
                name={post.name}
                price={post.price}
                image={post.images[0]}
              />
            </div>
          ))
        ) : (
          <span className="fs-1 d-block text-center m-4" role="status">
            {statusText}
          </span>
        )}
      </div>
    </div>
  )
}

export default HomePostsPage
