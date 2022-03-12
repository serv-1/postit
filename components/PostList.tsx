import { IPost } from '../types/common'
import Post from './Post'

interface PostListProps {
  posts: IPost[]
}

const PostList = ({ posts }: PostListProps) => {
  return (
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
  )
}

export default PostList
