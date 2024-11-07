import { render, screen } from '@testing-library/react'
import useEventListener from '.'
import { useRef } from 'react'

it('adds/removes an event listener on the window', () => {
  const mockListener = jest.fn()

  function Test({ listener }: { listener: () => void }) {
    useEventListener('window', 'click', listener)

    return null
  }

  const { unmount } = render(<Test listener={mockListener} />)

  window.dispatchEvent(new Event('click'))

  expect(mockListener).toHaveBeenCalledTimes(1)

  unmount()

  window.dispatchEvent(new Event('click'))

  expect(mockListener).not.toHaveBeenCalledTimes(2)
})

it('adds/removes an event listener on the document', () => {
  const mockListener = jest.fn()

  function Test({ listener }: { listener: () => void }) {
    useEventListener('document', 'click', listener)

    return null
  }

  const { unmount } = render(<Test listener={mockListener} />)

  document.dispatchEvent(new Event('click'))

  expect(mockListener).toHaveBeenCalledTimes(1)

  unmount()

  document.dispatchEvent(new Event('click'))

  expect(mockListener).not.toHaveBeenCalledTimes(2)
})

it('adds/removes an event listener on an html element', () => {
  const mockListener = jest.fn()

  function Test({ listener }: { listener: () => void }) {
    const divRef = useRef<HTMLDivElement>(null)

    useEventListener(divRef, 'click', listener)

    return <div data-testid="div" ref={divRef}></div>
  }

  const { unmount } = render(<Test listener={mockListener} />)

  const div = screen.getByTestId('div')

  div.dispatchEvent(new Event('click'))

  expect(mockListener).toHaveBeenCalledTimes(1)

  unmount()

  div.dispatchEvent(new Event('click'))

  expect(mockListener).not.toHaveBeenCalledTimes(2)
})

it('uses the given options', () => {
  const mockListener = jest.fn()

  function Test({ listener }: { listener: () => void }) {
    useEventListener('document', 'click', listener, {
      once: true,
    })

    return null
  }

  render(<Test listener={mockListener} />)

  document.dispatchEvent(new Event('click'))
  document.dispatchEvent(new Event('click'))

  expect(mockListener).toHaveBeenCalledTimes(1)
})
