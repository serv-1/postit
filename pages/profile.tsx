import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'

const Profile = () => {
  const { data } = useSession()
  const { name, email } = (data as Session).user

  return (
    <main data-cy="profile" className="w-75 m-auto shadow rounded">
      <h1 className="bg-primary text-light rounded-top p-2 m-0">
        Welcome {name} <small className="fs-6">({email})</small>
      </h1>
    </main>
  )
}

Profile.needAuth = true

export default Profile
