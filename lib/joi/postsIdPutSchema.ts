import object from './object'
import { csrfTokenSchema } from './csrfTokenSchema'
import { nameSchema } from './nameSchema'
import { descriptionSchema } from './descriptionSchema'
import { categoriesSchema } from './categoriesSchema'
import { priceSchema } from './priceSchema'
import { imagesArraySchema } from './imagesSchema'
import err from '../../utils/constants/errors'
import { Categories, Image } from '../../types/common'

export type PostsIdPutSchema =
  | { csrfToken: string; name: string }
  | { csrfToken: string; description: string }
  | { csrfToken: string; categories: Categories[] }
  | { csrfToken: string; price: number }
  | { csrfToken: string; images: Image[] }

export const postsIdPutSchema = object<PostsIdPutSchema>({
  csrfToken: csrfTokenSchema,
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  categories: categoriesSchema.optional(),
  price: priceSchema.optional(),
  images: imagesArraySchema.optional(),
})
  .xor('name', 'description', 'categories', 'price', 'images')
  .messages({ 'object.xor': err.DATA_INVALID })
