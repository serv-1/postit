import ReactSelect, { StylesConfig, MultiValue } from 'react-select'
import { Controller } from 'react-hook-form'
import classNames from 'classnames'
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager'

export interface Option {
  label: string
  value: string
}

export interface SelectProps extends StateManagerProps<Option, true> {
  name: string
  options: Option[]
}

const Select = ({ name, options, className, ...props }: SelectProps) => {
  return (
    <Controller
      name={name}
      render={({ field, formState: { isSubmitted, errors } }) => {
        const selectClass = classNames(
          'border border-indigo-600 rounded',
          className,
          {
            'is-invalid': isSubmitted && errors.categories,
            'is-valid': isSubmitted && !errors.categories,
          }
        )

        const styles: StylesConfig<Option> = {
          control: () => ({ display: 'flex', minHeight: 32 }),
          menu: (provided) => ({ ...provided, border: '1px solid #4f46e5' }),
          valueContainer: (provided) => ({
            ...provided,
            paddingLeft: 0,
            height: 32,
          }),
          placeholder: (provided) => ({ ...provided, paddingLeft: 4 }),
          input: (provided) => ({ ...provided, paddingLeft: 4 }),
          indicatorsContainer: (provided) => ({ ...provided, height: 32 }),
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

        const selectValue = options.filter(({ value }) =>
          field.value?.includes(value)
        )

        const onChange = (val: MultiValue<Option>) =>
          field.onChange(val.map(({ value }) => value))

        return (
          <>
            <ReactSelect
              isMulti
              {...field}
              data-testid="selectContainer"
              inputId={field.name}
              options={options}
              className={selectClass}
              styles={styles}
              value={selectValue}
              onChange={onChange}
              aria-label={props['aria-label']}
            />
          </>
        )
      }}
    />
  )
}

export default Select
