import axios from 'axios'
import { Session } from 'next-auth'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useToast } from '../contexts/toast'
import getApiError from '../utils/getApiError'
import Button from './Button'
import Modal from './Modal'
import OpenModalButton from './OpenModalButton'

const ProfileDeleteAccount = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const { setToast } = useToast()
  const { data } = useSession()
  const { id } = (data as Session).user

  const deleteUser = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/auth/csrf')

      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        data: { csrfToken: res.data.csrfToken },
      })

      const data = await signOut({ redirect: false, callbackUrl: '/' })

      router.push(data.url)
    } catch (e) {
      const { message } = getApiError(e)
      setToast({ message, background: 'danger' })
    }
  }

  return (
    <div className="text-center">
      <OpenModalButton
        name="Delete your account"
        className="btn-danger"
        setIsModalOpen={setIsModalOpen}
      />
      {isModalOpen && (
        <Modal
          title="Do you really want to delete your account?"
          setIsModalOpen={setIsModalOpen}
        >
          <p>
            You are about to delete your account thats means you will no longer
            be available to sign in with it. Please take your time to think
            about it because this action is definitive.
          </p>
          <div className="text-end">
            <Button
              className="btn-secondary me-2"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="btn-danger" onClick={() => deleteUser()}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ProfileDeleteAccount
