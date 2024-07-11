import type { Post as IPost } from 'types'
import Post from 'components/Post'

interface PostListProps {
  posts: IPost[]
}

export default function PostList({ posts }: PostListProps) {
  return (
    <ul className="grid grid-cols-[repeat(6,1fr)] gap-x-16 gap-y-8">
      {posts.map((post) => (
        <li className="col-span-3 sm:col-span-2" key={post._id}>
          <Post
            id={post._id}
            name={post.name}
            price={post.price}
            image={post.images[0]}
            address={post.address}
          />
        </li>
      ))}
    </ul>
  )
}
