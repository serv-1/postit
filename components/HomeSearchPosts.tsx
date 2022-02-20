import Button from './Button'
import Form from './Form'
import Input from './Input'
import Label from './Label'
import Select from './Select'
import Search from '../public/static/images/search.svg'
import categories from '../categories'
import InputError from './InputError'
import { SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import {
  searchPostsSchema,
  SearchPostsSchema,
} from '../lib/joi/searchPostsSchema'
import { useEffect } from 'react'
import { Categories } from '../types/common'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

const HomeSearchPosts = () => {
  const methods = useForm<SearchPostsSchema>({
    resolver: joiResolver(searchPostsSchema),
  })

  const submitHandler: SubmitHandler<SearchPostsSchema> = (data) => {
    const { query, minPrice, maxPrice, categories } = data

    const url = new URLSearchParams({ query: query })

    if (minPrice) url.append('minPrice', minPrice)
    if (maxPrice) url.append('maxPrice', maxPrice)
    if (categories) categories.forEach((c) => url.append('categories', c))

    window.history.pushState('', '', '?' + url.toString())

    document.dispatchEvent(new CustomEvent('queryStringChange'))
  }

  useEffect(() => {
    if (!window.location.search) return

    const queryString = new URLSearchParams(window.location.search)
    const categories = queryString.getAll('categories') as Categories[]

    methods.setValue('categories', categories)
    methods.setValue('query', queryString.get('query') as string)
    methods.setValue('minPrice', queryString.get('minPrice') || undefined)
    methods.setValue('maxPrice', queryString.get('maxPrice') || undefined)
  }, [methods])

  return (
    <Form
      name="searchPost"
      method="get"
      methods={methods}
      submitHandlers={{ submitHandler }}
      className="m-auto position-relative"
      style={{ maxWidth: 720 }}
      role="search"
    >
      <Label
        labelText="Search posts"
        htmlFor="search"
        className="fs-1 fw-bold text-white"
      />
      <div className="row">
        <div className="col-10 gx-2">
          <div className="row">
            <div className="col position-relative">
              <Input
                name="query"
                type="search"
                placeholder="Nimbus 2000, invisibility cloak, ..."
              />
              <InputError
                inputName="query"
                className="m-0 p-2 rounded bg-dark position-absolute top-50"
                style={{
                  transform: 'translateX(calc(-100% - 8px)) translateY(-50%)',
                  maxWidth: 300,
                }}
              />
            </div>
          </div>
          <div className="row gx-2">
            <div className="col-3 gy-2 position-relative">
              <Input
                name="minPrice"
                type="number"
                placeholder="Min. price"
                aria-label="Minimum price"
              />
              <InputError
                inputName="minPrice"
                className="m-0 p-2 rounded bg-dark position-absolute top-50"
                style={{
                  transform: 'translateX(calc(-100% - 8px)) translateY(-50%)',
                  minWidth: 300,
                }}
              />
            </div>
            <div className="col-3 gy-2 position-relative">
              <Input
                name="maxPrice"
                type="number"
                placeholder="Max. price"
                aria-label="Maximum price"
              />
              <InputError
                inputName="maxPrice"
                className="m-0 p-2 rounded bg-dark position-absolute end-0"
                style={{
                  transform: 'translateY(8px) translateX(-4px)',
                }}
              />
            </div>
            <div className="col gy-2 position-relative">
              <Select
                name="categories"
                options={options}
                aria-label="Categories"
              />
              <InputError
                inputName="categories"
                className="m-0 p-2 rounded bg-dark position-absolute start-0"
                style={{
                  transform: 'translateY(8px) translateX(4px)',
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-2 gx-2">
          <Button
            type="submit"
            className="btn-primary w-100 h-100"
            gradient
            aria-label="Search"
          >
            <Search className="w-50 h-50" />
          </Button>
        </div>
      </div>
    </Form>
  )
}

export default HomeSearchPosts
