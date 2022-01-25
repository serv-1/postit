import ProfileDeleteAccount from '../components/ProfileDeleteAccount'
import ProfileChangeImage from '../components/ProfileChangeImage'
import ProfileChangeNameOrEmail from '../components/ProfileChangeNameOrEmail'
import ProfileChangePassword from '../components/ProfileChangePassword'

const Profile = () => {
  return (
    <main data-cy="profile" className="container-fluid my-4">
      <div className="col-md-6 col-6 m-auto">
        <ProfileChangeImage />
        <div className="my-2 d-flex flex-column">
          <ProfileChangeNameOrEmail subject="name" />
          <ProfileChangeNameOrEmail subject="email" />
        </div>
        <ProfileChangePassword />
        <ProfileDeleteAccount />
      </div>
    </main>
  )
}

Profile.needAuth = true

export default Profile
