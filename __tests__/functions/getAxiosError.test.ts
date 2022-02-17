import err from '../../utils/constants/errors'
import getAxiosError from '../../utils/functions/getAxiosError'

it('return the NO_RESPONSE error message if there is no response', () => {
  const e = {
    isAxiosError: true,
    config: {},
    toJSON: () => ({}),
    name: 'error name',
    message: 'error message',
  }

  const result = getAxiosError(e)

  expect(result).toEqual({ message: err.NO_RESPONSE })
})

it("return the error's name and message with the response status code", () => {
  const e = {
    isAxiosError: true,
    config: {},
    toJSON: () => ({}),
    name: 'error name',
    message: 'error message',
    response: {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: {},
      data: { name: 'name', message: err.NAME_INVALID },
    },
  }

  const result = getAxiosError(e)

  expect(result).toEqual({
    name: 'name',
    message: err.NAME_INVALID,
    status: 422,
  })
})

it("only return the error's message and the response status code", () => {
  const e = {
    isAxiosError: true,
    config: {},
    toJSON: () => ({}),
    name: 'error name',
    message: 'error message',
    response: {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {},
      data: { message: err.USER_NOT_FOUND },
    },
  }

  const result = getAxiosError(e)

  expect(result).toEqual({ message: err.USER_NOT_FOUND, status: 404 })
})
