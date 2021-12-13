import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'

const Profile = () => {
  const { data } = useSession()
  const { username } = (data as Session).user

  return (
    <main className="w-75 m-auto shadow rounded">
      <div>Welcome {username}</div>
    </main>
  )
}

Profile.needAuth = true

export default Profile
