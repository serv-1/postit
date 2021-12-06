import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'

const Profile = () => {
  const { data } = useSession()
  const user = (data as Session).user

  return <div>Welcome {user.email}!</div>
}

Profile.needAuth = true

export default Profile
