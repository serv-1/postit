import type { SearchedPost, UserPost } from 'types'
import Post from 'components/Post'

interface PostListProps {
  posts: (SearchedPost | UserPost)[]
}

export default function PostList({ posts }: PostListProps) {
  return (
    <ul className="grid grid-cols-[repeat(6,1fr)] gap-x-16 gap-y-8">
      {posts.map((post) => (
        <li className="col-span-3 sm:col-span-2" key={post.id}>
          <Post {...post} />
        </li>
      ))}
    </ul>
  )
}
