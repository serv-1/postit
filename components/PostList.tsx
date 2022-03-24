import { ISearchedPost, IUserPost } from '../types/common'
import Post from './Post'

interface PostListProps {
  posts: ISearchedPost[] | IUserPost[]
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
          image={'image' in post ? post.image : post.images[0]}
        />
      ))}
    </>
  )
}

export default PostList
