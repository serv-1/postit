import Joi from 'joi'
import err from '../utils/constants/errors'

const latLonSchema = Joi.array()
  .items(Joi.number().required(), Joi.number().required())
  .length(2)
  .messages({
    'array.base': err.LATLON_INVALID,
    'array.length': err.LATLON_INVALID,
    'array.includesRequiredUnknowns': err.LATLON_INVALID,
    'any.required': err.LATLON_REQUIRED,
  })

export default latLonSchema
