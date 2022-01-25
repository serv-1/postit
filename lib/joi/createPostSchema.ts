import categoriesSchema from './categoriesSchema'
import csrfTokenSchema from './csrfTokenSchema'
import descriptionSchema from './descritptionSchema'
import { imagesObjectSchema, imagesArraySchema } from './imagesSchema'
import { nameSchema } from './nameSchema'
import object from './object'
import priceSchema from './priceSchema'

export const createPostClientSchema = object({
  name: nameSchema,
  description: descriptionSchema,
  categories: categoriesSchema,
  price: priceSchema,
  images: imagesObjectSchema,
  csrfToken: csrfTokenSchema,
})

export const createPostServerSchema = object({
  name: nameSchema,
  description: descriptionSchema,
  categories: categoriesSchema,
  price: priceSchema,
  images: imagesArraySchema,
  csrfToken: csrfTokenSchema,
})
