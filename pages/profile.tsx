import ProfileDeleteAccount from '../components/ProfileDeleteAccount'
import ProfileChangeImage from '../components/ProfileChangeImage'
import ProfileChangeNameOrEmail from '../components/ProfileChangeNameOrEmail'
import ProfileChangePassword from '../components/ProfileChangePassword'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import ProfilePost from '../components/ProfilePost'
import { Post, User } from '../types/common'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  if (!session) {
    return { notFound: true }
  }

  const url = `http://localhost:3000/api/users/${session.id}`
  const res = await axios.get<User>(url)

  const { postsIds, ...rest } = res.data

  const user: typeof rest & { posts: Post[] } = { ...rest, posts: [] }

  if (postsIds) {
    for (const id of postsIds) {
      const res = await axios.get<Post>(`http://localhost:3000/api/posts/${id}`)
      user.posts.push(res.data)
    }
  }

  return { props: { user } }
}

interface ProfileProps {
  user: Omit<User, 'postsIds'> & { posts: Post[] }
}

const Profile = ({ user }: ProfileProps) => {
  return (
    <main
      data-cy="profile"
      className="py-32 grid grid-cols-4 md:grid-cols-[repeat(6,72px)] gap-x-16 justify-center"
    >
      <section className="col-span-full mb-32">
        <h1 className="text-4xl md:text-t-4xl lg:text-d-4xl font-bold mb-16">
          Profile
        </h1>
        <ProfileChangeImage image={user.image} />
        <ProfileChangeNameOrEmail value={user.name} type="name" />
        <ProfileChangeNameOrEmail value={user.email} type="email" />
      </section>
      <section className="col-span-full mb-32">
        <h2 className="text-3xl md:text-t-3xl lg:text-d-3xl font-bold mb-16">
          Posts
        </h2>
        {user.posts.map((post) => (
          <ProfilePost key={post.id} post={post} />
        ))}
      </section>
      <section className="col-span-full mb-32">
        <h2 className="text-3xl md:text-t-3xl lg:text-d-3xl font-bold mb-16">
          Personal data
        </h2>
        <ProfileChangePassword />
      </section>
      <ProfileDeleteAccount />
    </main>
  )
}

Profile.needAuth = true

export default Profile
