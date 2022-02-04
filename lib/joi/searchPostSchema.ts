import Joi from 'joi'
import err from '../../utils/constants/errors'
import { categoriesSchema } from './categoriesSchema'
import object from './object'
import pageSchema from './pageSchema'
import { priceSchema } from './priceSchema'
import querySchema from './querySchema'

const searchPostSchema = object({
  query: querySchema,
  page: pageSchema,
  minPrice: priceSchema.default(0),
  maxPrice: Joi.alternatives().conditional('minPrice', {
    is: '',
    then: priceSchema,
    otherwise: priceSchema
      .min(Joi.ref('minPrice'))
      .messages({ 'number.min': err.MAX_PRICE_MIN }),
  }),
  categories: categoriesSchema.min(0),
})

export default searchPostSchema
