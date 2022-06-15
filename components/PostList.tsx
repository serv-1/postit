import { ILightPost, IUserPost } from '../types/common'
import Post from './Post'

interface PostListProps {
  posts: ILightPost[] | IUserPost[]
  columns?: 3 | 2
}

const PostList = ({ posts, columns = 3 }: PostListProps) => {
  return (
    <ul
      className={
        'grid grid-cols-[1fr] gap-x-16 gap-y-8 ' +
        (columns === 3
          ? 'md:grid-cols-[1fr,1fr,1fr]'
          : 'md:grid-cols-[1fr,1fr]')
      }
    >
      {posts.map((post) => (
        <li className="w-full h-full" key={post.id}>
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
