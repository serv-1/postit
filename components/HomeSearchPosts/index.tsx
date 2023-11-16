'use client'

import Form from 'components/Form'
import Input from 'components/Input'
import Select from 'components/Select'
import { CATEGORIES } from 'constants/index'
import InputError from 'components/InputError'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { useEffect } from 'react'
import type { Categories } from 'types'
import searchPost, { type SearchPost } from 'schemas/searchPost'
import Popup from 'components/Popup'

const options = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export default function HomeSearchPosts() {
  const methods = useForm<SearchPost>({ resolver: joiResolver(searchPost) })

  const { formState } = methods

  const submitHandler: SubmitHandler<SearchPost> = (data) => {
    const { query, minPrice, maxPrice, categories, address } = data

    const url = new URLSearchParams({ query })

    for (const category of categories) {
      url.append('categories', category)
    }

    if (minPrice) url.append('minPrice', minPrice)
    if (maxPrice) url.append('maxPrice', maxPrice)
    if (address) url.append('address', address)

    const newUrl = '?' + url.toString()
    const state = { ...window.history.state, as: newUrl, url: newUrl }

    // To avoid rerender with router.push(), we use pushState.
    // We must specify the state because if we do not NextJS fails to send
    // us back to the previous page.
    // see: https://github.com/vercel/next.js/discussions/18072
    window.history.pushState(state, '', newUrl)

    document.dispatchEvent(new CustomEvent('queryStringChange'))
  }

  useEffect(() => {
    if (!window.location.search) return

    const queryString = new URLSearchParams(window.location.search)
    const categories = queryString.getAll('categories') as Categories[]
    const query = queryString.get('query')

    if (query) methods.setValue('query', query)
    methods.setValue('categories', categories)
    methods.setValue('minPrice', queryString.get('minPrice'))
    methods.setValue('maxPrice', queryString.get('maxPrice'))
    methods.setValue('address', queryString.get('address'))
  }, [methods])

  useEffect(() => {
    if (!formState.isSubmitSuccessful) return
    methods.reset(undefined, { keepValues: true })
  }, [methods, formState])

  return (
    <Form
      name="searchPost"
      method="get"
      methods={methods}
      submitHandler={submitHandler}
      role="search"
      className="relative"
    >
      <div className="mb-8 md:inline-block md:w-[calc(50%-4px)] md:align-top lg:block lg:w-auto md:mr-8 lg:mr-0">
        <Select<SearchPost>
          name="categories"
          options={options}
          aria-label="Categories"
          placeholder="Categories"
        />
        <InputError<SearchPost> inputName="categories" />
      </div>
      <div className="mb-8 md:inline-block md:w-[calc(50%-4px)] md:align-top lg:block lg:w-auto">
        <Input<SearchPost>
          name="query"
          type="search"
          className="bg-fuchsia-50"
          placeholder="Umbrella, sofa, ..."
        />
        <InputError<SearchPost> inputName="query" />
      </div>
      <Popup
        placement="bottom-start"
        offset={[0, 4]}
        containerClassName="inline-block mr-8"
        referenceClassName="hover:bg-fuchsia-600 text-fuchsia-600 hover:text-fuchsia-50 border-2 border-fuchsia-600 px-8 py-4 rounded-full transition-colors duration-200 font-bold"
        referenceContent="Price"
        popupClassName="bg-fuchsia-200 border-2 border-fuchsia-500 shadow-[0_0_16px_#D946EF] rounded-8 z-50 p-16 w-full max-w-[328px] lg:max-w-none"
        popupContent={
          <>
            <div className="font-bold mb-8">Price</div>
            <div className="flex flex-row flex-nowrap">
              <div className="mr-8 w-[calc(50%-4px)]">
                <label htmlFor="minPrice">Minimum</label>
                <Input<SearchPost>
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  addOn={<span className="text-fuchsia-900/50">€</span>}
                  className="bg-fuchsia-50"
                  needFocus
                />
              </div>
              <div className="w-[calc(50%-4px)]">
                <label htmlFor="maxPrice">Maximum</label>
                <Input<SearchPost>
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  addOn={<span className="text-fuchsia-900/50">€</span>}
                  className="bg-fuchsia-50"
                />
              </div>
            </div>
            <InputError<SearchPost> inputName="minPrice" />
            <InputError<SearchPost> inputName="maxPrice" />
          </>
        }
      />
      <Popup
        placement="bottom-start"
        offset={[0, 4]}
        containerClassName="inline-block"
        referenceClassName="hover:bg-fuchsia-600 text-fuchsia-600 hover:text-fuchsia-50 border-2 border-fuchsia-600 px-8 py-4 rounded-full transition-colors duration-200 font-bold"
        referenceContent="Address"
        popupClassName="bg-fuchsia-200 border-2 border-fuchsia-500 shadow-[0_0_16px_#D946EF] rounded-8 z-50 p-16 w-full max-w-[328px] lg:max-w-none"
        popupContent={
          <>
            <div className="font-bold mb-8">Address</div>
            <label htmlFor="address">
              A city, county, state, country or a postal code is expected.
            </label>
            <Input<SearchPost>
              id="address"
              name="address"
              type="text"
              needFocus
              className="bg-fuchsia-50"
            />
            <InputError<SearchPost> inputName="address" />
          </>
        }
      />
      <div className="absolute right-0 -bottom-[36px] md:left-1/2 md:-translate-x-1/2 md:right-auto lg:right-0 lg:left-auto lg:translate-x-0 z-10">
        <button className="primary-btn">Search</button>
      </div>
    </Form>
  )
}
