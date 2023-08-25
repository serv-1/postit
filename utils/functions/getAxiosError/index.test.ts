import err from 'utils/constants/errors'
import getAxiosError from '.'

it('returns the NO_RESPONSE error message if there is no response', () => {
  const e = {
    isAxiosError: true,
    config: {},
    toJSON: () => ({}),
    name: 'error name',
    message: 'error message',
  }

  expect(getAxiosError(e)).toEqual({ message: err.NO_RESPONSE })
})

it("returns the error's name and message with the response status code", () => {
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

  expect(getAxiosError(e)).toEqual({
    name: 'name',
    message: err.NAME_INVALID,
    status: 422,
  })
})

it("only returns the error's message and the response status code", () => {
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

  expect(getAxiosError(e)).toEqual({ message: err.USER_NOT_FOUND, status: 404 })
})
