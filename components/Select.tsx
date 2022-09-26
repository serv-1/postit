import ReactSelect, {
  StylesConfig,
  MultiValue,
  CSSObjectWithLabel,
} from 'react-select'
import { useController, FieldValues, FieldPath } from 'react-hook-form'
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager'
import { Categories } from '../types/common'

export interface Option {
  label: Categories
  value: Categories
}

export interface SelectProps<FormFields extends FieldValues = FieldValues>
  extends StateManagerProps<Option, true> {
  name: FieldPath<FormFields>
  options: Option[]
}

const Select = <FormFields extends FieldValues = FieldValues>({
  name,
  options,
  ...props
}: SelectProps<FormFields>) => {
  const { field, formState } = useController<FormFields>({ name })
  const { isSubmitted, errors } = formState

  const styles: StylesConfig<Option> = {
    control: (provided, states) => {
      const styles: CSSObjectWithLabel = {
        display: 'flex',
        height: 40,
        backgroundColor: '#FDF4FF',
        borderRadius: '4px',
      }

      if (isSubmitted && errors[name]) {
        styles.border = `2px solid #${states.isFocused ? '881337' : 'E11D48'}`
      } else {
        const a = states.isFocused ? '0.75' : '0.25'
        styles.borderBottom = `2px solid rgba(112,26,117,${a})`
      }

      return styles
    },
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#fdf4ff',
      borderBottom: '2px solid rgba(112,26,117,0.25)',
      zIndex: 9999,
    }),
    placeholder: (provided) => ({ ...provided, color: 'rgba(112,26,117,0.5)' }),
    option: (provided, state) => {
      return {
        ...provided,
        backgroundColor: state.isFocused ? '#f5d0fe' : provided.backgroundColor,
        '&:hover': { backgroundColor: '#f5d0fe' },
      }
    },
    indicatorSeparator: () => ({ display: 'none' }),
    valueContainer: (provided) => ({ ...provided, overflowY: 'auto' }),
  }

  const value = options.filter(({ value }) => {
    if (Array.isArray(field.value)) {
      return field.value.includes(value)
    }
  })

  const onChange = (val: MultiValue<Option>) =>
    field.onChange(val.map(({ value }) => value))

  return (
    <ReactSelect
      isMulti
      {...field}
      instanceId={field.name}
      inputId={field.name}
      options={options}
      styles={styles}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}

export default Select
