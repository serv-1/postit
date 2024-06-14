import { render } from '@testing-library/react'
import usePusher from '.'

jest.mock('libs/pusher/client', () => ({
  subscribe: jest.fn(),
}))

const channel = {
  bind: jest.fn(),
  unbind: jest.fn(),
}

const mockSubscribe = jest.spyOn(require('libs/pusher/client'), 'subscribe')

function Test({ eventHandler }: { eventHandler: () => void }) {
  usePusher('testChannel', 'testEvent', eventHandler)

  return null
}

beforeEach(() => {
  mockSubscribe.mockReturnValue(channel)
})

it('binds an event handler to a channel', () => {
  const eventHandler = jest.fn()

  render(<Test eventHandler={eventHandler} />)

  expect(mockSubscribe).toHaveBeenNthCalledWith(1, 'testChannel')
  expect(channel.bind).toHaveBeenNthCalledWith(1, 'testEvent', eventHandler)
})

it('unbinds the event handler from the channel when the component unmounts', () => {
  const eventHandler = jest.fn()

  render(<Test eventHandler={eventHandler} />).unmount()

  expect(channel.unbind).toHaveBeenNthCalledWith(1, 'testEvent', eventHandler)
})
