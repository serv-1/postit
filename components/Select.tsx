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
        const selectClass = classNames('form-control py-0', className, {
          'is-invalid': isSubmitted && errors.categories,
          'is-valid': isSubmitted && !errors.categories,
        })

        const styles: StylesConfig<Option> = {
          control: () => ({ display: 'flex', minHeight: 36 }),
          menu: (provided) => ({ ...provided, marginLeft: -12 }),
          valueContainer: (provided) => ({ ...provided, paddingLeft: 0 }),
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
