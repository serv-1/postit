import axios, { AxiosError } from 'axios'
import { getCsrfToken, signOut } from 'next-auth/react'
import { useToast } from 'contexts/toast'
import getAxiosError from 'utils/functions/getAxiosError'
import Modal from 'components/Modal'
import X from 'public/static/images/x.svg'
import { useState } from 'react'
import Button from 'components/Button'

export default function DeleteAccountModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { setToast } = useToast()

  const deleteUser = async () => {
    try {
      const data = { csrfToken: await getCsrfToken() }
      await axios.delete('/api/user', { data })

      await signOut({ callbackUrl: '/' })
    } catch (e) {
      const { message } = getAxiosError(e as AxiosError)
      setToast({ message, error: true })
    }
  }

  return (
    <>
      <Button color="danger" fullWidth onClick={() => setIsOpen(true)}>
        Delete account
      </Button>
      {isOpen && (
        <Modal
          setIsOpen={setIsOpen}
          className="absolute top-0 left-0 w-screen h-screen md:bg-[rgba(112,26,117,0.25)] md:flex md:justify-center md:items-center"
        >
          <div className="h-full bg-fuchsia-100 flex flex-col p-16 md:bg-fuchsia-50 md:rounded-16 md:shadow-[0_0_32px_rgba(112,26,117,0.25)] md:w-[450px] md:h-auto">
            <button
              className="w-32 h-32 text-fuchsia-600 self-end mb-16 hover:text-fuchsia-900 transition-colors duration-200 md:mb-0"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-full h-full" />
            </button>
            <div className="flex-grow">
              <h2>Do you really want to delete your account?</h2>
              <p className="my-16 md:my-32">
                Your account and all the posts created will be deleted
                permanently. Please take your time to think about it because
                this action is irreversible.
              </p>
            </div>
            <div className="flex flex-row flew-nowrap gap-x-24">
              <Button
                color="primary"
                fullWidth
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button color="danger" fullWidth onClick={deleteUser}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
