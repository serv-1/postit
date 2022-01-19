import { AxiosError } from 'axios'
import err from './errors'

interface GetErrorReturn<TName> {
  name?: TName
  status?: number
  message: string
}

const getApiError = <TName extends string>(
  e: unknown
): GetErrorReturn<TName> => {
  let error: GetErrorReturn<TName> = { message: err.DEFAULT_SERVER_ERROR }

  if ((e as AxiosError).isAxiosError) {
    const res = (e as AxiosError<GetErrorReturn<TName>>).response

    if (!res) {
      error.message = err.NO_RESPONSE
    } else {
      const { message, name } = res.data
      error = { message, name, status: res.status }
    }
  }

  return error
}

export default getApiError
