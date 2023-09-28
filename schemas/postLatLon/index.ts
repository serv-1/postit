import Joi from 'joi'
import err from 'utils/constants/errors'

const postLatLon = Joi.array()
  .items(Joi.number().required(), Joi.number().required())
  .length(2)
  .messages({
    'array.base': err.LATLON_INVALID,
    'array.length': err.LATLON_INVALID,
    'array.includesRequiredUnknowns': err.LATLON_INVALID,
    'array.includes': err.LATLON_INVALID,
  })

export default postLatLon
