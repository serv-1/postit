import { render } from '@testing-library/react'
import useToast from '.'
import ToastProvider from 'components/ToastProvider'

it('returns the context', () => {
  function Test() {
    expect(useToast()).not.toBeUndefined()

    return null
  }

  render(
    <ToastProvider>
      <Test />
    </ToastProvider>
  )
})

it('throws an error if it is used outside the ToastProvider', () => {
  expect(() => useToast()).toThrow()
})
