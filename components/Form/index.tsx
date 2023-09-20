import type { ComponentPropsWithoutRef } from 'react'
import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
  type SubmitHandler,
  type SubmitErrorHandler,
} from 'react-hook-form'

type FormProps<FormFields extends FieldValues = FieldValues> =
  ComponentPropsWithoutRef<'form'> & {
    methods: UseFormReturn<FormFields>
    submitHandler: SubmitHandler<FormFields>
    submitErrorHandler?: SubmitErrorHandler<FormFields>
  }

export default function Form<FormFields extends FieldValues = FieldValues>({
  methods,
  submitHandler,
  submitErrorHandler,
  children,
  ...props
}: FormProps<FormFields>) {
  return (
    <FormProvider {...methods}>
      <form
        {...props}
        id={props.name}
        action=""
        noValidate
        onSubmit={methods.handleSubmit(submitHandler, submitErrorHandler)}
      >
        {children}
      </form>
    </FormProvider>
  )
}
