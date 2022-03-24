import Button from './Button'
import Form from './Form'
import Input from './Input'
import Select from './Select'
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
    const query = queryString.get('query')

    if (query) methods.setValue('query', query)
    methods.setValue('categories', categories)
    methods.setValue('minPrice', queryString.get('minPrice') || undefined)
    methods.setValue('maxPrice', queryString.get('maxPrice') || undefined)
  }, [methods])

  return (
    <Form
      name="searchPost"
      method="get"
      methods={methods}
      submitHandler={submitHandler}
      role="search"
      className="col-span-full grid grid-cols-[repeat(2,1fr)] gap-8 md:grid-cols-[repeat(6,1fr)] lg:grid-cols-[repeat(5,1fr)]"
    >
      <div className="col-span-full">
        <InputError<SearchPostsSchema> inputName="query" />
        <InputError<SearchPostsSchema> inputName="minPrice" />
        <InputError<SearchPostsSchema> inputName="maxPrice" />
        <InputError<SearchPostsSchema> inputName="categories" />
      </div>
      <Input<SearchPostsSchema>
        name="query"
        type="search"
        placeholder="Nimbus 2000, invisibility cloak, ..."
        className="col-span-full lg:col-span-2"
      />
      <Input<SearchPostsSchema>
        name="minPrice"
        type="number"
        placeholder="Min. price"
        aria-label="Minimum price"
        className="col-span-1 md:col-span-3 lg:col-span-2"
      />
      <Input<SearchPostsSchema>
        name="maxPrice"
        type="number"
        placeholder="Max. price"
        aria-label="Maximum price"
        className="col-span-1 md:col-span-3 lg:col-span-2"
      />
      <Select<SearchPostsSchema>
        name="categories"
        options={options}
        aria-label="Categories"
        className="col-span-full md:col-span-4 lg:row-start-2 lg:col-start-3 lg:col-span-2"
      />
      <Button
        type="submit"
        className="col-span-full md:col-span-2 lg:row-start-2 lg:row-span-2 lg:col-start-5"
        aria-label="Search"
      >
        Search
      </Button>
    </Form>
  )
}

export default HomeSearchPosts
