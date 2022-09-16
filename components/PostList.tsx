import { LightPost, Post as IPost } from '../types/common'
import Post from './Post'

interface PostListProps {
  posts: LightPost[] | IPost[]
}

const PostList = ({ posts }: PostListProps) => {
  return (
    <ul className="flex flex-col sm:flex-row flex-wrap gap-x-16 gap-y-8">
      {posts.map((post) => (
        <li
          className="w-full h-full sm:w-[calc(50%-8px)] sm:h-[calc(50%-8px)] md:w-[calc(100%/3-32px/3)] md:h-[calc(100%/3-32px/3)]"
          key={post.id}
        >
          <Post
            id={post.id}
            name={post.name}
            price={post.price}
            image={'image' in post ? post.image : post.images[0]}
            address={post.address}
          />
        </li>
      ))}
    </ul>
  )
}

export default PostList
