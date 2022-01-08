import ProfileDeleteAccount from '../components/ProfileDeleteAccount'
import Toast from '../components/Toast'
import UpdateImage from '../components/UpdateImage'
import UpdateNameOrEmail from '../components/UpdateNameOrEmail'
import UpdatePassword from '../components/UpdatePassword'

const Profile = () => {
  return (
    <main data-cy="profile" className="my-4">
      <Toast />
      <UpdateImage />
      <h1 className="text-center my-2">
        <UpdateNameOrEmail subject="name" />
        <UpdateNameOrEmail subject="email" />
      </h1>
      <UpdatePassword />
      <ProfileDeleteAccount />
    </main>
  )
}

Profile.needAuth = true

export default Profile
