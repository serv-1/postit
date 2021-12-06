import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
// commonJS needed https://github.com/react-hook-form/resolvers/issues/271
const { joiResolver } = require('@hookform/resolvers/joi')
import Joi from 'joi'
import axios, { AxiosError } from 'axios'
import { ChangeEvent, useState } from 'react'
const zxcvbn = require('zxcvbn')
import { useRouter } from 'next/router'

const schema = Joi.object({
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      'string.base': 'The email is not valid.',
      'string.empty': 'The email cannot be empty.',
      'string.email': 'The email is not valid.',
      'any.required': 'The email is required.',
    }),
  password: Joi.string()
    .required()
    .invalid(Joi.ref('email'))
    .min(10)
    .max(20)
    .messages({
      'string.base': 'The password is not valid.',
      'string.empty': 'The password cannot be empty.',
      'any.invalid': 'The password cannot be the same as email.',
      'string.min': 'The password must have 10 characters.',
      'string.max': 'The password cannot exceed 20 characters.',
      'any.required': 'The password is required.',
    }),
  confirm_password: Joi.ref('password'),
})

type FormInput = {
  email: string
  password: string
  confirm_password: string
}

type TechnicalError = {
  message: string
}

type PasswordStrength = {
  estimated_time: string
  score: number
}

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>()
  const [technicalError, setTechnicalError] = useState<TechnicalError>()
  const {
    register,
    formState: { errors, isSubmitted },
    handleSubmit,
    setError,
  } = useForm<FormInput>({ resolver: joiResolver(schema) })
  const router = useRouter()

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      await axios.post('http://localhost:3000/api/users', {
        email: data.email,
        password: data.password,
        validateStatus: (status: number) => status >= 200 && status <= 301,
      })
      router.push('/')
    } catch (e) {
      const err = e as AxiosError
      if (!err.response) return
      if (err.response.status === 422) {
        setError(
          err.response.data.name,
          { type: '', message: err.response.data.message },
          { shouldFocus: true }
        )
      } else {
        setTechnicalError(err.response.data.message)
      }
    }
  }

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const result = zxcvbn(e.target.value)
    setPasswordStrength({
      estimated_time:
        result.crack_times_display.offline_slow_hashing_1e4_per_second,
      score: result.score,
    })
  }

  return (
    <>
      <Head>
        <title>Filanad - Sign up!</title>
      </Head>
      <h1 className="bg-primary text-light rounded-top p-2 m-0">Sign up!</h1>
      {technicalError && (
        <div
          className="fw-bold p-2 m-2 text-light bg-danger rounded-3"
          role="alert"
        >
          {technicalError}
        </div>
      )}
      <form
        name="signup"
        id="signup"
        className="p-2 text-end"
        method="post"
        action=""
        encType="application/json"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`form-control ${
              isSubmitted && (errors.email ? 'is-invalid' : 'is-valid')
            }`}
            aria-describedby="emailFeedback"
          />
          {errors.email && (
            <div className="invalid-feedback" id="emailFeedback" role="alert">
              {errors.email.message}
            </div>
          )}
        </div>
        <div className="mb-3 text-start">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="form-text m-0" id="passwordRules">
            Your password must be 10-20 characters long. It must not equal the
            email. There is no characters restriction so you can use emojis,
            cyrillic, etc. 😎
          </div>
          <div className="input-group">
            <button
              id="visibilityBtn"
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'hide' : 'show'}
            </button>
            <input
              {...register('password', { onChange: onPasswordChange })}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`form-control ${
                isSubmitted && (errors.password ? 'is-invalid' : 'is-valid')
              }`}
              aria-describedby="passwordRules passwordStrength passwordFeedback visibilityBtn"
            />
            {passwordStrength && (
              <span
                className={`input-group-text text-white ${
                  passwordStrength.score <= 2
                    ? 'bg-danger'
                    : passwordStrength.score === 3
                    ? 'bg-warning'
                    : 'bg-success'
                }`}
                id="passwordStrength"
                role="status"
              >
                Need {passwordStrength.estimated_time} to crack
              </span>
            )}
          </div>
          {errors.password && (
            <div
              className="invalid-feedback"
              id="passwordFeedback"
              role="alert"
            >
              {errors.password.message}
            </div>
          )}
        </div>
        <div className="mb-3 text-start">
          <label htmlFor="confirm_password" className="form-label">
            Confirm your password
          </label>
          <input
            {...register('confirm_password')}
            type="password"
            id="confirm_password"
            className={`form-control ${
              isSubmitted &&
              (errors.confirm_password ? 'is-invalid' : 'is-valid')
            }`}
            aria-describedby="confirmPasswordFeedback"
          />
          {errors.confirm_password && (
            <div
              className="invalid-feedback"
              id="confirmPasswordFeedback"
              role="alert"
            >
              Those passwords must be identical.
            </div>
          )}
        </div>
        <input type="submit" value="Sign up" className="btn btn-primary" />
      </form>
    </>
  )
}

export default Signup
