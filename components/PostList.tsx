import { Post as IPost } from '../types/common'
import Post from './Post'

export interface PostListProps {
  posts?: IPost[]
}

const PostList = ({ posts }: PostListProps) => {
  return posts && posts.length > 0 ? (
    <>
      {posts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          name={post.name}
          price={post.price}
          image={post.images[0]}
        />
      ))}
    </>
  ) : (
    <div
      className="col-span-full text-center text-4xl md:text-t-4xl lg:text-d-4xl"
      role="status"
    >
      {!posts ? 'Search something ☝' : 'No posts found 😮'}
    </div>
  )
}

export default PostList
