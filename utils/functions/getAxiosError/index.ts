import { AxiosError } from 'axios'
import err from 'utils/constants/errors'

interface Response<TName> {
  name?: TName
  message?: string
}

export default function getAxiosError<TName extends string>(e: unknown) {
  const res = (e as AxiosError<Response<TName>>).response

  if (!res) {
    return {
      message: err.NO_RESPONSE,
    }
  } else {
    return {
      message: res.data.message,
      name: res.data.name,
      status: res.status,
    }
  }
}
