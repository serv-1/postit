import axios, { AxiosError } from 'axios'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import Button from './Button'
import Modal from './Modal'

const ProfileDeleteAccount = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { setToast } = useToast()

  const deleteUser = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/auth/csrf')

      const data = { csrfToken: res.data.csrfToken }
      await axios.delete(`http://localhost:3000/api/user`, { data })

      await signOut({ callbackUrl: '/' })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Button
        className="col-span-2 col-start-2 md:col-start-3 bg-red-500 hover:bg-red-700"
        onClick={() => setIsModalOpen(true)}
      >
        Delete account
      </Button>
      {isModalOpen && (
        <Modal title="Delete account" setIsOpen={setIsModalOpen}>
          <p className="mb-16">
            Your account and all the posts created with it will be deleted
            permanently. Please take your time to think about it because this
            action is irreversible.
          </p>
          <div className="flex">
            <Button
              className="flex-grow mr-16"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-grow bg-red-500 hover:bg-red-700"
              onClick={() => deleteUser()}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default ProfileDeleteAccount
