import { ComponentPropsWithoutRef } from 'react'
import * as RHF from 'react-hook-form'

type FormProps<FormFields extends RHF.FieldValues = RHF.FieldValues> =
  ComponentPropsWithoutRef<'form'> & {
    methods: RHF.UseFormReturn<FormFields>
    submitHandler: RHF.SubmitHandler<FormFields>
    submitErrorHandler?: RHF.SubmitErrorHandler<FormFields>
  } & (FormFields extends { csrfToken: string }
      ? { csrfToken?: string }
      : { csrfToken?: never })

const Form = <FormFields extends RHF.FieldValues = RHF.FieldValues>({
  methods,
  submitHandler,
  submitErrorHandler,
  csrfToken,
  children,
  ...props
}: FormProps<FormFields>) => {
  const { handleSubmit, register } = methods
  return (
    <RHF.FormProvider {...methods}>
      <form
        {...props}
        id={props.name}
        action=""
        noValidate
        onSubmit={handleSubmit(submitHandler, submitErrorHandler)}
      >
        {csrfToken && (
          <input
            {...register('csrfToken' as any)}
            type="hidden"
            value={csrfToken}
          />
        )}
        {children}
      </form>
    </RHF.FormProvider>
  )
}

export default Form
