import ReactSelect, { type CSSObjectWithLabel } from 'react-select'
import {
  useController,
  type FieldValues,
  type FieldPath,
} from 'react-hook-form'
import type { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager'
import type { Categories } from 'types'

export interface Option {
  label: Categories
  value: Categories
}

export interface SelectProps<FormFields extends FieldValues = FieldValues>
  extends StateManagerProps<Option, true> {
  name: FieldPath<FormFields>
  options: Option[]
}

export default function Select<FormFields extends FieldValues = FieldValues>({
  name,
  options,
  ...props
}: SelectProps<FormFields>) {
  const { field, formState } = useController<FormFields>({ name })
  const { isSubmitted, errors } = formState

  return (
    <ReactSelect
      isMulti
      {...field}
      instanceId={field.name}
      inputId={field.name}
      options={options}
      styles={{
        control: (provided, states) => {
          const styles: CSSObjectWithLabel = {
            display: 'flex',
            height: 40,
            backgroundColor: '#FDF4FF',
            borderRadius: '4px',
          }

          if (isSubmitted && errors[name]) {
            styles.border =
              '2px solid #' + (states.isFocused ? '881337' : 'E11D48')
          } else {
            styles.borderBottom = `2px solid rgba(112,26,117,${
              states.isFocused ? '0.75' : '0.25'
            })`
          }

          return styles
        },
        menu: (provided) => {
          provided.backgroundColor = '#fdf4ff'
          provided.borderBottom = '2px solid rgba(112,26,117,0.25)'
          provided.zIndex = 9999

          return provided
        },
        placeholder: (provided) => {
          provided.color = 'rgba(112,26,117,0.5)'

          return provided
        },
        option: (provided, state) => {
          if (state.isFocused) {
            provided.backgroundColor = '#f5d0fe'
          }

          provided['&:hover'] = { backgroundColor: '#f5d0fe' }

          return provided
        },
        indicatorSeparator: () => ({ display: 'none' }),
        valueContainer: (provided) => {
          provided.overflowY = 'auto'

          return provided
        },
      }}
      value={options.filter(({ value }) => {
        if (Array.isArray(field.value)) {
          return field.value.includes(value)
        }
      })}
      onChange={(val) => field.onChange(val.map(({ value }) => value))}
      {...props}
    />
  )
}
