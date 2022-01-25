import Label from './Label'
import categories from '../categories'
import { Controller } from 'react-hook-form'
import Select, { MultiValue, StylesConfig } from 'react-select'
import InputError from './InputError'
import classNames from 'classnames'

export interface Option {
  label: string
  value: string
}

const FormCategoriesField = () => {
  const options = categories.map((category) => ({
    label: category,
    value: category,
  }))

  return (
    <div className="mb-3 text-start">
      <Label labelText="Categories" htmlFor="categories" />
      <Controller
        name="categories"
        render={({ field, formState: { isSubmitted, errors } }) => {
          const className = classNames({
            'border border-danger rounded is-invalid':
              isSubmitted && errors.categories,
            'border border-success rounded is-valid':
              isSubmitted && !errors.categories,
          })

          const styles: StylesConfig<Option> = {
            control: (provided) => ({
              ...provided,
              border: isSubmitted ? 'none' : undefined,
            }),
          }

          const selectValue = options.filter(({ value }) =>
            field.value?.includes(value)
          )

          const onChange = (val: MultiValue<Option>) =>
            field.onChange(val.map(({ value }) => value))

          return (
            <>
              <Select
                isMulti
                {...field}
                data-testid="selectContainer"
                inputId={field.name}
                options={options}
                className={className}
                styles={styles}
                value={selectValue}
                onChange={onChange}
              />
              <InputError inputName="categories" />
            </>
          )
        }}
      />
    </div>
  )
}

export default FormCategoriesField
