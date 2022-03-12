import ReactSelect, { StylesConfig, MultiValue } from 'react-select'
import { useController } from 'react-hook-form'
import classNames from 'classnames'
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager'
import { Categories } from '../types/common'

interface Option {
  label: Categories
  value: Categories
}

interface FieldValues {
  [x: string]: Categories[]
}

interface SelectProps extends StateManagerProps<Option, true> {
  name: string
  options: Option[]
}

const Select = ({ name, options, className, ...props }: SelectProps) => {
  const { field, formState } = useController<FieldValues>({ name })
  const { isSubmitted, errors } = formState

  const selectClass = classNames(
    'border border-indigo-600 rounded',
    className,
    isSubmitted && errors[name] ? 'border-red-600' : 'border-indigo-600'
  )

  const styles: StylesConfig<Option> = {
    control: () => ({ display: 'flex' }),
    menu: (provided) => ({ ...provided, border: '1px solid #4f46e5' }),
    valueContainer: (provided) => ({ ...provided, padding: '0 8px 0 0' }),
    placeholder: (provided) => ({ ...provided, paddingLeft: 4 }),
    input: (provided) => ({ ...provided, paddingLeft: 4 }),
    option: (provided, state) => {
      const backgroundColor = state.isFocused
        ? '#c7d2fe'
        : provided.backgroundColor
      return {
        ...provided,
        backgroundColor,
        '&:hover': { backgroundColor: '#c7d2fe' },
      }
    },
  }

  const value = options.filter(({ value }) => field.value?.includes(value))

  const onChange = (val: MultiValue<Option>) =>
    field.onChange(val.map(({ value }) => value))

  return (
    <ReactSelect
      isMulti
      {...field}
      inputId={field.name}
      options={options}
      className={selectClass}
      styles={styles}
      value={value}
      onChange={onChange}
      aria-label={props['aria-label']}
    />
  )
}

export default Select
