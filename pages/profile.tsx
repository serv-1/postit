import ProfileDeleteAccount from '../components/ProfileDeleteAccount'
import ProfileChangeImage from '../components/ProfileChangeImage'
import ProfileChangeNameOrEmail from '../components/ProfileChangeNameOrEmail'
import ProfileChangePassword from '../components/ProfileChangePassword'
import { useEffect, useState } from 'react'
import { Session, User } from 'next-auth'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import getApiError from '../utils/functions/getApiError'
import { useToast } from '../contexts/toast'

const Profile = () => {
  const { data } = useSession()
  const { id } = data as Session

  const { setToast } = useToast()

  const [user, setUser] = useState<User>()

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${id}`)
        setUser(res.data)
      } catch (e) {
        const { message } = getApiError(e)
        setToast({ message, background: 'danger' })
      }
    }
    getUser()
  }, [setUser, id, setToast])

  return (
    <main data-cy="profile" className="container-fluid my-4">
      <div className="col-md-6 col-6 m-auto">
        <ProfileChangeImage id={user?.id} image={user?.image} />
        <div className="my-2 d-flex flex-column">
          <ProfileChangeNameOrEmail
            id={user?.id}
            value={user?.name}
            type="name"
          />
          <ProfileChangeNameOrEmail
            id={user?.id}
            value={user?.email}
            type="email"
          />
        </div>
        <ProfileChangePassword id={user?.id} />
        <ProfileDeleteAccount id={user?.id} />
      </div>
    </main>
  )
}

Profile.needAuth = true

export default Profile
