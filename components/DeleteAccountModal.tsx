import axios, { AxiosError } from 'axios'
import { getCsrfToken, signOut } from 'next-auth/react'
import { useToast } from '../contexts/toast'
import getAxiosError from '../utils/functions/getAxiosError'
import MainButton from './MainButton'
import Modal from './Modal'
import X from '../public/static/images/x.svg'

const DeleteAccountModal = () => {
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
      <Modal<HTMLButtonElement, HTMLButtonElement, HTMLButtonElement>
        id="deleteAccountModal"
        openerId="deleteAccountOpener"
        renderOpener={(setIsOpen) => (
          <MainButton
            id="deleteAccountOpener"
            className="w-full"
            onClick={() => setIsOpen(true)}
          >
            Delete account
          </MainButton>
        )}
        className="absolute top-0 left-0 w-screen h-screen md:bg-[rgba(112,26,117,0.25)] md:flex md:justify-center md:items-center"
        renderContent={(setup) => (
          <div className="h-full bg-fuchsia-100 flex flex-col flex-nowrap p-16 md:bg-fuchsia-50 md:rounded-16 md:shadow-[0_0_32px_rgba(112,26,117,0.25)] md:w-[450px] md:h-auto">
            <button
              ref={setup.firstFocusable}
              onKeyDown={setup.onShiftTab}
              className="w-32 h-32 text-fuchsia-600 self-end mb-16 hover:text-fuchsia-900 transition-colors duration-200 md:mb-0"
              aria-label="Close"
              onClick={() => setup.setIsOpen(false)}
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
            <div className="flex flex-row flew-nowrap">
              <MainButton
                ref={setup.focused}
                className="w-full mr-24 bg-fuchsia-300 text-fuchsia-900"
                onClick={() => setup.setIsOpen(false)}
              >
                Cancel
              </MainButton>
              <MainButton
                ref={setup.lastFocusable}
                onKeyDown={setup.onTab}
                className="w-full"
                onClick={deleteUser}
              >
                Delete
              </MainButton>
            </div>
          </div>
        )}
      />
    </>
  )
}

export default DeleteAccountModal
