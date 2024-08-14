'use client'

import Form from 'components/Form'
import Input from 'components/Input'
import Select from 'components/Select'
import { CATEGORIES } from 'constants/index'
import InputError from 'components/InputError'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import type { Categories } from 'types'
import searchPost, { type SearchPost } from 'schemas/client/searchPost'
import Popup from 'components/Popup'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const options = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export default function SearchPostForm() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  let values: SearchPost | undefined = undefined

  if (searchParams.has('query')) {
    values = {
      query: searchParams.get('query')!,
      categories: searchParams.getAll('categories') as Categories[],
    }

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const address = searchParams.get('address')

    if (minPrice) values.minPrice = minPrice
    if (maxPrice) values.maxPrice = maxPrice
    if (address) values.address = address
  }

  const methods = useForm<SearchPost>({
    resolver: joiResolver(searchPost),
    values,
  })

  const submitHandler: SubmitHandler<SearchPost> = ({
    query,
    minPrice,
    maxPrice,
    categories,
    address,
  }) => {
    const searchParams = new URLSearchParams({ query })

    for (const category of categories) {
      searchParams.append('categories', category)
    }

    if (minPrice) searchParams.append('minPrice', minPrice)
    if (maxPrice) searchParams.append('maxPrice', maxPrice)
    if (address) searchParams.append('address', address)

    router.push(pathname + '?' + searchParams.toString())
  }

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
        <InputError<SearchPost> name="categories" />
      </div>
      <div className="mb-8 md:inline-block md:w-[calc(50%-4px)] md:align-top lg:block lg:w-auto">
        <Input<SearchPost>
          name="query"
          type="search"
          className="bg-fuchsia-50"
          placeholder="Umbrella, sofa, ..."
        />
        <InputError<SearchPost> name="query" />
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
            <InputError<SearchPost> name="minPrice" />
            <InputError<SearchPost> name="maxPrice" />
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
            <InputError<SearchPost> name="address" />
          </>
        }
      />
      <div className="absolute right-0 -bottom-[36px] md:left-1/2 md:-translate-x-1/2 md:right-auto lg:right-0 lg:left-auto lg:translate-x-0 z-10">
        <button className="primary-btn">Search</button>
      </div>
    </Form>
  )
}
