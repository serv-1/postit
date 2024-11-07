import { render, waitFor } from '@testing-library/react'
import usePusher from '.'
// @ts-ignore
import { mockSubscribe } from 'libs/pusher/client'

const mockBind = jest.fn()
const mockUnbind = jest.fn()
const eventHandler = jest.fn()

jest.mock('libs/pusher/client')

function Test({ eventHandler }: { eventHandler: () => void }) {
  usePusher('testChannel', 'testEvent', eventHandler)

  return null
}

it('binds an event handler to a channel', async () => {
  mockSubscribe.mockReturnValue({ bind: mockBind, unbind: mockUnbind })

  render(<Test eventHandler={eventHandler} />)

  await waitFor(() => {
    expect(mockSubscribe).toHaveBeenNthCalledWith(1, 'testChannel')
    expect(mockBind).toHaveBeenNthCalledWith(1, 'testEvent', eventHandler)
  })
})

it('unbinds the event handler from the channel when the component unmounts', async () => {
  mockSubscribe.mockReturnValue({ bind: mockBind, unbind: mockUnbind })

  const { unmount } = render(<Test eventHandler={eventHandler} />)

  await waitFor(() => {
    expect(mockBind).toHaveBeenCalled()
  })

  unmount()

  expect(mockUnbind).toHaveBeenNthCalledWith(1, 'testEvent', eventHandler)
})
