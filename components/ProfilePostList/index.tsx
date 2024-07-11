'use client'

import { useState } from 'react'
import ProfilePost from 'components/ProfilePost'
import type { Post } from 'types'

interface ProfilePostListProps {
  type: 'default' | 'favorite'
  posts: Post[]
  placeholder: string
}

export default function ProfilePostList({
  type,
  posts: postsProps,
  placeholder,
}: ProfilePostListProps) {
  const [posts, setPosts] = useState(postsProps)

  return posts.length > 0 ? (
    <ul>
      {posts.map((post) => (
        <li key={post._id} className="mb-8 last:mb-0 md:mb-16">
          <ProfilePost
            id={post._id}
            name={post.name}
            image={post.images[0]}
            type={type}
            setPosts={setPosts}
          />
        </li>
      ))}
    </ul>
  ) : (
    <div className="text-center">{placeholder}</div>
  )
}
