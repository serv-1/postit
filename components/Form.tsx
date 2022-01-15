import classNames from 'classnames'
import React from 'react'
import * as RHF from 'react-hook-form'

export interface FormProps<TFieldValues>
  extends React.ComponentPropsWithoutRef<'form'> {
  children: React.ReactNode
  submitHandlers: {
    submitHandler: RHF.SubmitHandler<TFieldValues>
    submitErrorHandler?: RHF.SubmitErrorHandler<TFieldValues>
  }
  methods: RHF.UseFormReturn<TFieldValues>
  csrfToken?: string
}

const Form = <TFieldValues extends RHF.FieldValues>(
  props: FormProps<TFieldValues>
) => {
  const className = classNames('p-2', props.className)
  const { submitHandler, submitErrorHandler } = props.submitHandlers
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
        {props.csrfToken && (
          <input type="hidden" name="csrfToken" value={props.csrfToken} />
        )}
        {props.children}
      </form>
    </RHF.FormProvider>
  )
}

export default Form
