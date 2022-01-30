import Label from './Label'
import categories from '../categories'
import Select from './Select'
import InputError from './InputError'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

const FormCategoriesField = () => (
  <div className="mb-3 text-start">
    <Label labelText="Categories" htmlFor="categories" />
    <Select name="categories" options={options} />
    <InputError inputName="categories" />
  </div>
)

export default FormCategoriesField
