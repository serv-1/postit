import axios, { AxiosError } from 'axios'
import { getCsrfToken, signOut } from 'next-auth/react'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import MainButton from './MainButton'
import Modal from './Modal'

const ProfileDeleteAccount = () => {
  const { setToast } = useToast()

  const deleteUser = async () => {
    try {
      const data = { csrfToken: await getCsrfToken() }
      await axios.delete(`http://localhost:3000/api/user`, { data })

      await signOut({ callbackUrl: '/' })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Modal
        title="Delete account"
        renderActionElement={(setIsOpen) => (
          <MainButton
            className="col-span-2 col-start-2 md:col-start-3 bg-red-500 hover:bg-red-700"
            onClick={() => setIsOpen(true)}
          >
            Delete account
          </MainButton>
        )}
        renderContent={(setIsOpen) => (
          <>
            <p className="mb-16">
              Your account and all the posts created with it will be deleted
              permanently. Please take your time to think about it because this
              action is irreversible.
            </p>
            <div className="flex">
              <MainButton
                className="flex-grow mr-16"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </MainButton>
              <MainButton
                className="flex-grow bg-red-500 hover:bg-red-700"
                onClick={() => deleteUser()}
              >
                Delete
              </MainButton>
            </div>
          </>
        )}
      />
    </>
  )
}

export default ProfileDeleteAccount
