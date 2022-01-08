import axios, { AxiosError } from 'axios'
import { Session } from 'next-auth'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useToast } from '../contexts/toast'
import err from '../utils/errors'

const DeleteUser = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setToast } = useToast()
  const { data } = useSession()
  const { id } = (data as Session).user

  const deleteUser = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`)
      const data = await signOut({ redirect: false, callbackUrl: '/' })
      router.push(data.url)
    } catch (e) {
      const res = (e as AxiosError).response
      if (!res)
        return setToast({ message: err.NO_RESPONSE, background: 'danger' })
      setToast({
        message: res.data.message || err.DEFAULT_SERVER_ERROR,
        background: 'danger',
      })
    }
  }

  return (
    <div className="w-25 m-auto">
      <button className="btn btn-danger w-100" onClick={() => setOpen(true)}>
        Delete your account
      </button>
      {open && (
        <div
          data-testid="modal"
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <div className="position-relative bg-white p-2 w-25 rounded shadow start-50 translate-middle-x mt-5">
            <header className="d-flex justify-content-between">
              <h2>Do you really want to delete your account?</h2>
              <button
                aria-label="Close"
                className="btn btn-close"
                onClick={() => setOpen(false)}
              ></button>
            </header>
            <p>
              You are about to delete your account thats means you will no
              longer be available to sign in with it. Please take your time to
              think about it because this action is definitive.
            </p>
            <div className="text-end">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => deleteUser()}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteUser
