import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
// commonJS needed because of a bug
// https://github.com/react-hook-form/resolvers/issues/271
const { joiResolver } = require('@hookform/resolvers/joi')
import Joi from 'joi'

const schema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(10).max(20).invalid(Joi.ref('email')).required(),
  confirm_password: Joi.ref('password'),
})

type FormInput = {
  email: string
  password: string
  confirm_password: string
}

const Signup = () => {
  const {
    register,
    formState: { errors, isSubmitted },
    handleSubmit,
  } = useForm<FormInput>({ resolver: joiResolver(schema) })

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    console.log(data)
  }

  return (
    <>
      <Head>
        <title>Filanad - Sign up!</title>
      </Head>
      <h1 className="bg-primary text-light rounded-top p-2">Sign up !</h1>
      <form
        className="p-2"
        method="POST"
        action=""
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-3">
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
              This email address is invalid.
            </div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="form-text m-0" id="passwordRules">
            Your password must be 10-20 characters long. It must not equal the
            email. There is no characters restriction so you can use emojis,
            cyrillic, etc. 😎
          </div>
          <input
            {...register('password')}
            type="password"
            id="password"
            className={`form-control ${
              isSubmitted && (errors.password ? 'is-invalid' : 'is-valid')
            }`}
            aria-describedby="passwordRules"
          />
          {errors.password && (
            <div
              className="invalid-feedback"
              id="passwordFeedback"
              role="alert"
            >
              This password is invalid.
            </div>
          )}
        </div>
        <div className="mb-3">
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
        <button type="submit" className="btn btn-primary">
          Sign up
        </button>
      </form>
    </>
  )
}

export default Signup
