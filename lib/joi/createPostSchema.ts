import { reqCategoriesSchema } from './categoriesSchema'
import csrfTokenSchema from './csrfTokenSchema'
import { descriptionSchema } from './descritptionSchema'
import { imagesObjectSchema, imagesArraySchema } from './imagesSchema'
import { nameSchema } from './nameSchema'
import object from './object'
import { reqPriceSchema } from './priceSchema'

const createPostSchema = object({
  name: nameSchema,
  description: descriptionSchema,
  categories: reqCategoriesSchema,
  price: reqPriceSchema,
  csrfToken: csrfTokenSchema,
})

export const createPostClientSchema = createPostSchema.append({
  images: imagesObjectSchema,
})

export const createPostServerSchema = createPostSchema.append({
  images: imagesArraySchema,
})
