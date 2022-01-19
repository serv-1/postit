import axios from 'axios'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import * as RHF from 'react-hook-form'

export interface FormProps<TFieldValues>
  extends React.ComponentPropsWithoutRef<'form'> {
  children: React.ReactNode
  methods: RHF.UseFormReturn<TFieldValues>
  needCsrfToken?: boolean
  submitHandlers: {
    submitHandler: RHF.SubmitHandler<TFieldValues>
    submitErrorHandler?: RHF.SubmitErrorHandler<TFieldValues>
  }
}

const Form = <TFieldValues extends RHF.FieldValues>(
  props: FormProps<TFieldValues>
) => {
  const [csrfToken, setCsrfToken] = useState<string | undefined>()

  const className = classNames('p-2', props.className)
  const { submitHandler, submitErrorHandler } = props.submitHandlers

  useEffect(() => {
    const getCsrfToken = async () => {
      if (props.needCsrfToken) {
        const res = await axios.get('http://localhost:3000/api/auth/csrf')
        setCsrfToken(res.data.csrfToken)
      }
    }
    getCsrfToken()
  }, [props.needCsrfToken])

  return (
    <RHF.FormProvider {...props.methods}>
      <form
        name={props.name}
        id={props.name}
        className={className}
        action=""
        method={props.method}
        noValidate
        onSubmit={props.methods.handleSubmit(submitHandler, submitErrorHandler)}
      >
        {csrfToken && (
          <input
            data-testid="csrfToken"
            {...props.methods.register('csrfToken' as any)}
            type="hidden"
            value={csrfToken}
          />
        )}
        {props.children}
      </form>
    </RHF.FormProvider>
  )
}

export default Form
