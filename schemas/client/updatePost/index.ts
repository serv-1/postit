import type { Categories } from 'types'
import imageList from 'schemas/imageList'
import name from 'schemas/name'
import postDescription from 'schemas/postDescription'
import postCategories from 'schemas/postCategories'
import postPrice from 'schemas/postPrice'
import postAddress from 'schemas/postAddress'
import err from 'utils/constants/errors'
import createObjectSchema from 'utils/functions/createObjectSchema'

export interface UpdatePost {
  name?: string
  description?: string
  categories?: Categories[]
  price?: number
  images?: File[]
  address?: string
}

const updatePost = createObjectSchema<UpdatePost>({
  name: name.allow(''),
  description: postDescription.allow(''),
  categories: postCategories,
  price: postPrice
    .allow('')
    .min(1)
    .messages({ 'number.min': err.PRICE_INVALID }),
  address: postAddress.allow(''),
  images: imageList,
})

export default updatePost
