import ProfileDeleteAccount from '../components/ProfileDeleteAccount'
import ProfileChangeImage from '../components/ProfileChangeImage'
import ProfileChangeNameOrEmail from '../components/ProfileChangeNameOrEmail'
import ProfileChangePassword from '../components/ProfileChangePassword'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import ProfilePostsList from '../components/ProfilePostsList'
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

  for (const id of postsIds) {
    const res = await axios.get<Post>(`http://localhost:3000/api/posts/${id}`)
    user.posts.push(res.data)
  }

  return { props: { user } }
}

interface ProfileProps {
  user: Omit<User, 'postsIds'> & { posts: Post[] }
}

const Profile = ({ user }: ProfileProps) => {
  return (
    <main data-cy="profile" className="container-fluid my-4">
      <div className="col-md-6 col-6 m-auto">
        <ProfileChangeImage image={user.image} />
        <div className="my-2 d-flex flex-column">
          <ProfileChangeNameOrEmail value={user.name} type="name" />
          <ProfileChangeNameOrEmail value={user.email} type="email" />
        </div>
        <ProfilePostsList posts={user.posts} />
        <ProfileChangePassword />
        <ProfileDeleteAccount />
      </div>
    </main>
  )
}

Profile.needAuth = true

export default Profile
