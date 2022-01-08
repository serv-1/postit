import axios, { AxiosError } from 'axios'
import Joi, { ValidationError } from 'joi'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useToast } from '../contexts/toast'
import err from '../utils/errors'
import { passwordRules } from '../utils/joiSchemas'

const UpdatePassword = () => {
  const { data } = useSession()
  const { id } = (data as Session).user
  const { setToast } = useToast()

  const updatePassword = async (value: string) => {
    try {
      Joi.assert(value, passwordRules)
      await axios.put(`http://localhost:3000/api/users/:${id}`, {
        password: value,
      })
      setToast({
        message: 'Your password has been updated! 🎉',
        background: 'success',
      })
    } catch (e) {
      if (e instanceof ValidationError) {
        return setToast({ message: e.details[0].message, background: 'danger' })
      }
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
    <div className="w-25 my-4 p-2 m-auto rounded border border-1">
      <form
        name="updatePassword"
        action=""
        method="post"
        noValidate
        encType="application/json"
        onSubmit={(e) => {
          e.preventDefault()
          const value = (e.currentTarget.elements[0] as HTMLInputElement).value
          updatePassword(value)
        }}
      >
        <label htmlFor="password" className="mb-2">
          Change your password
        </label>
        <div className="input-group">
          <input
            className="form-control"
            type="password"
            name="password"
            id="password"
          />
          <input className="btn btn-primary" type="submit" value="Change" />
        </div>
      </form>
    </div>
  )
}

export default UpdatePassword
