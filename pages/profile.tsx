import ProfileDeleteAccount from '../components/ProfileDeleteAccount'
import ProfileChangeImage from '../components/ProfileChangeImage'
import ProfileChangeNameOrEmail from '../components/ProfileChangeNameOrEmail'
import ProfileChangePassword from '../components/ProfileChangePassword'
import { User } from 'next-auth'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)

  if (!session) {
    return { notFound: true }
  }

  const res = await axios.get(`http://localhost:3000/api/users/${session.id}`)

  return { props: { user: res.data } }
}

interface ProfileProps {
  user: User
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
        <ProfileChangePassword />
        <ProfileDeleteAccount />
      </div>
    </main>
  )
}

Profile.needAuth = true

export default Profile
