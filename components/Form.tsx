import { getCsrfToken } from 'next-auth/react'
import { ComponentPropsWithoutRef, useEffect, useState } from 'react'
import * as RHF from 'react-hook-form'

type FormProps<FormFields extends RHF.FieldValues = RHF.FieldValues> =
  ComponentPropsWithoutRef<'form'> & {
    methods: RHF.UseFormReturn<FormFields>
    submitHandler: RHF.SubmitHandler<FormFields>
    submitErrorHandler?: RHF.SubmitErrorHandler<FormFields>
  } & (FormFields extends { csrfToken: string }
      ? { needCsrfToken: true }
      : { needCsrfToken?: false })

const Form = <FormFields extends RHF.FieldValues = RHF.FieldValues>({
  methods,
  submitHandler,
  submitErrorHandler,
  needCsrfToken,
  children,
  ...props
}: FormProps<FormFields>) => {
  const { handleSubmit, register } = methods

  const [csrfToken, setCsrfToken] = useState<string>()

  useEffect(() => {
    const csrf = async () => setCsrfToken(await getCsrfToken())
    if (needCsrfToken) csrf()
  }, [needCsrfToken])

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
            data-testid="csrfToken"
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
