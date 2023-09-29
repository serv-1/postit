import { LATLON_INVALID } from 'constants/errors'
import Joi from 'joi'

const postLatLon = Joi.array()
  .items(Joi.number().required(), Joi.number().required())
  .length(2)
  .messages({
    'array.base': LATLON_INVALID,
    'array.length': LATLON_INVALID,
    'array.includesRequiredUnknowns': LATLON_INVALID,
    'array.includes': LATLON_INVALID,
  })

export default postLatLon
