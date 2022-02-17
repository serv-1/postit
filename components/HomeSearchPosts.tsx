import Button from './Button'
import Form from './Form'
import Input from './Input'
import Label from './Label'
import Select from './Select'
import Search from '../public/static/images/search.svg'
import categories from '../categories'
import InputError from './InputError'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import getAxiosError from '../utils/functions/getAxiosError'
import { useToast } from '../contexts/toast'
import { joiResolver } from '@hookform/resolvers/joi'
import { searchPostSchema } from '../lib/joi/searchPostSchema'
import axios, { AxiosError } from 'axios'
import { Post } from '../types/common'

const options = categories.map((category) => ({
  label: category,
  value: category,
}))

interface Response {
  posts: Post[]
  totalPages: number
  totalPosts: number
}

interface FormFields {
  query: string
  minPrice?: number
  maxPrice?: number
  categories?: typeof categories
}

interface HomeSearchPostsProps {
  setPosts: Dispatch<SetStateAction<Post[] | undefined>>
  setTotalPosts: Dispatch<SetStateAction<number>>
  setTotalPages: Dispatch<SetStateAction<number>>
  currentPage: number
}

const HomeSearchPosts = ({
  setPosts,
  setTotalPosts,
  setTotalPages,
  currentPage,
}: HomeSearchPostsProps) => {
  const methods = useForm<FormFields>({
    resolver: joiResolver(searchPostSchema),
  })

  const { setToast } = useToast()

  const [formData, setFormData] = useState<FormFields>()

  useEffect(() => {
    const getPosts = async () => {
      try {
        const { data } = await axios.get<Response>(
          'http://localhost:3000/api/posts/search',
          { params: { ...formData, page: currentPage } }
        )

        setPosts(data.posts)
        setTotalPosts(data.totalPosts)
        setTotalPages(data.totalPages)
      } catch (e) {
        type FieldsNames = keyof FormFields
        const { name, message } = getAxiosError<FieldsNames>(e as AxiosError)

        if (name) {
          return methods.setError(name, { message }, { shouldFocus: true })
        }

        setToast({ message, background: 'danger' })
      }
    }
    if (formData) getPosts()
  }, [
    formData,
    currentPage,
    methods,
    setToast,
    setPosts,
    setTotalPosts,
    setTotalPages,
  ])

  const submitHandler: SubmitHandler<FormFields> = (data) => setFormData(data)

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
