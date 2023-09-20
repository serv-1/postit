import type { SearchedPost, UserPost } from 'types'
import Post from 'components/Post'

interface PostListProps {
  posts: (SearchedPost | UserPost)[]
}

export default function PostList({ posts }: PostListProps) {
  return (
    <ul className="flex flex-col sm:flex-row flex-wrap gap-x-16 gap-y-8">
      {posts.map((post) => (
        <li
          className="w-full h-full sm:w-[calc(50%-8px)] sm:h-[calc(50%-8px)] md:w-[calc(100%/3-32px/3)] md:h-[calc(100%/3-32px/3)]"
          key={post.id}
        >
          <Post {...post} />
        </li>
      ))}
    </ul>
  )
}
