import classNames from 'classnames'
import { type ComponentPropsWithoutRef, type ReactNode, useEffect } from 'react'
import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form'

const INPUT_BASE = 'p-8 border-b-2 transition-colors duration-200 rounded'
const CONTAINER_BASE =
  INPUT_BASE + ' w-full flex flex-row flex-nowrap items-center'

const OTHER_INPUT_BASE = 'outline-none placeholder:text-fuchsia-900/50 w-full'
const OIB_WITH_ADDON = OTHER_INPUT_BASE + ' rounded-r-none bg-transparent'
const FILE_INPUT_BASE =
  'file:border-none file:p-8 file:mr-8 file:text-fuchsia-900 file:bg-fuchsia-100 rounded p-0 hover:file:bg-fuchsia-600 hover:file:text-fuchsia-50 file:transition-colors file:duration-200 cursor-pointer file:cursor-pointer w-full'
const FIB_WITH_ADDON = FILE_INPUT_BASE + ' rounded-r-none bg-transparent'

export const BORDER = 'border-fuchsia-900/25 focus-within:border-fuchsia-900/75'
export const RED_BORDER =
  'border-2 border-rose-600 focus-within:border-rose-900'

interface InputWithoutAddOnProps {
  addOn?: undefined
  addOnClass?: undefined
}

interface InputWithAddOnProps {
  addOn: ReactNode
  addOnClass?: string
}

type InputProps<FormFields extends FieldValues> = {
  name: FieldPath<FormFields>
  registerOptions?: RegisterOptions<FormFields>
  type: 'text' | 'email' | 'number' | 'file' | 'password' | 'search'
  needFocus?: boolean
  bgColor?: string
  noRightRadius?: boolean
} & Omit<ComponentPropsWithoutRef<'input'>, 'className'> &
  (InputWithoutAddOnProps | InputWithAddOnProps)

export default function Input<FormFields extends FieldValues>({
  type,
  id,
  name,
  registerOptions,
  needFocus,
  bgColor,
  noRightRadius,
  addOn,
  addOnClass,
  'aria-describedby': ariaDescribedBy,
  ...props
}: InputProps<FormFields>) {
  const { register, setFocus, formState } = useFormContext<FormFields>()
  const { isSubmitted, errors } = formState

  useEffect(() => {
    if (needFocus) setFocus(name)
  }, [needFocus, setFocus, name])

  const border = isSubmitted && errors[name] ? RED_BORDER : BORDER

  const attributes = {
    type,
    ...register(name, registerOptions),
    id: id || name,
    'aria-describedby': classNames(`${name}Feedback`, ariaDescribedBy),
    ...props,
  }

  return addOn ? (
    <div
      data-testid="container"
      className={classNames(
        border,
        CONTAINER_BASE,
        noRightRadius && 'rounded-r-none',
        bgColor || 'bg-fuchsia-50'
      )}
    >
      <input
        {...attributes}
        className={type === 'file' ? FIB_WITH_ADDON : OIB_WITH_ADDON}
      />
      <div className={addOnClass}>{addOn}</div>
    </div>
  ) : (
    <input
      {...attributes}
      className={classNames(
        type === 'file' ? FILE_INPUT_BASE : OTHER_INPUT_BASE,
        border,
        INPUT_BASE,
        noRightRadius && 'rounded-r-none',
        bgColor || 'bg-fuchsia-50'
      )}
    />
  )
}
