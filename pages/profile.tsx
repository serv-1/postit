import ProfileDeleteAccount from '../components/ProfileDeleteAccount'
import Toast from '../components/Toast'
import ProfileChangeImage from '../components/ProfileChangeImage'
import ProfileChangeNameOrEmail from '../components/ProfileChangeNameOrEmail'
import ProfileChangePassword from '../components/ProfileChangePassword'

const Profile = () => {
  return (
    <main data-cy="profile" className="my-4">
      <Toast />
      <ProfileChangeImage />
      <div className="container my-2 d-flex flex-column">
        <ProfileChangeNameOrEmail subject="name" />
        <ProfileChangeNameOrEmail subject="email" />
      </div>
      <ProfileChangePassword />
      <ProfileDeleteAccount />
    </main>
  )
}

Profile.needAuth = true

export default Profile
