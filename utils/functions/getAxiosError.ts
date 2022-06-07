import { AxiosError } from 'axios'
import err from '../constants/errors'

interface Response<TName> {
  name?: TName
  message: string
}

/**
 * Get the error's name (if any) and message thrown by the API call.
 *
 * @param e error thrown
 * @returns error's name (if any) and message
 */
const getAxiosError = <TName extends string>(e: unknown) => {
  const res = (e as AxiosError<Response<TName>>).response

  if (!res) {
    return { message: err.NO_RESPONSE }
  } else {
    const { message, name } = res.data
    return { message, name, status: res.status }
  }
}

export default getAxiosError
