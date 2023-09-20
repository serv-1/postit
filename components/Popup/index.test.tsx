import Popup, { type PopupProps } from 'components/Popup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePopper } from 'react-popper'

jest.mock('react-popper', () => ({
  usePopper: jest.fn(),
}))

beforeEach(() =>
  (usePopper as jest.Mock).mockReturnValue({
    styles: { arrow: { color: 'red' }, popper: { color: 'green' } },
    attributes: { arrow: { id: 'arrow' }, popper: { id: 'popup' } },
  })
)

it('renders', () => {
  render(
    <Popup
      referenceContent="open"
      referenceClassName="blue"
      popupContent="popup"
      containerClassName="yellow"
    />
  )

  const reference = screen.getByText('open')
  expect(reference).toHaveClass('blue')

  const container = reference.parentElement?.parentElement
  expect(container).toHaveClass('yellow')

  const popup = screen.queryByText('popup')
  expect(popup).not.toBeInTheDocument()
})

it('opens/closes if the reference is clicked', async () => {
  render(
    <Popup
      referenceContent="open"
      popupContent="popup"
      popupClassName="blue"
      arrowClassName="black"
    />
  )

  const reference = screen.getByRole('button')
  await userEvent.click(reference)

  const popup = screen.getByText('popup')
  expect(popup).toHaveClass('blue')
  expect(popup).toHaveStyle({ color: 'green' })
  expect(popup).toHaveAttribute('id', 'popup')

  const arrow = popup.lastElementChild
  expect(arrow).toHaveClass('black')
  expect(arrow).toHaveStyle({ color: 'red' })
  expect(arrow).toHaveAttribute('id', 'arrow')

  await userEvent.click(reference)
  expect(popup).not.toBeInTheDocument()
})

it("closes if the click doesn't come from the container", async () => {
  render(<Popup referenceContent="open" popupContent="popup" openOnHover />)

  const reference = screen.getByRole('button')
  await userEvent.click(reference)

  const popup = screen.getByText('popup')
  expect(popup).toBeInTheDocument()

  await userEvent.click(document.body)
  expect(popup).not.toBeInTheDocument()
})

it('stays opened if the click comes from the popup', async () => {
  render(<Popup referenceContent="open" popupContent="popup" />)

  const reference = screen.getByRole('button')
  await userEvent.click(reference)

  const popup = screen.getByText('popup')
  await userEvent.click(popup)

  expect(popup).toBeInTheDocument()
})

it("doesn't open if the hover is disabled", async () => {
  const { rerender } = render(
    <Popup referenceContent="open" popupContent="popup" openOnHover={false} />
  )

  const container = screen.getByRole('button').parentElement as HTMLDivElement
  await userEvent.hover(container)

  const popup = screen.queryByText('popup')
  expect(popup).not.toBeInTheDocument()

  await userEvent.unhover(container)
  rerender(<Popup referenceContent="open" popupContent="popup" />)

  await userEvent.hover(container)
  expect(popup).not.toBeInTheDocument()
})

it('opens/closes if the container is hovered', async () => {
  render(<Popup referenceContent="open" popupContent="popup" openOnHover />)

  const container = screen.getByRole('button').parentElement as HTMLDivElement
  await userEvent.hover(container)

  const popup = screen.getByText('popup')
  expect(popup).toBeInTheDocument()

  await userEvent.unhover(container)
  expect(popup).not.toBeInTheDocument()
})

it("doesn't close if the reference is clicked and the container unhovered", async () => {
  render(<Popup referenceContent="open" popupContent="popup" openOnHover />)

  const reference = screen.getByRole('button')
  await userEvent.click(reference)

  const popup = screen.getByText('popup')
  expect(popup).toBeInTheDocument()

  const container = reference.parentElement as HTMLDivElement
  await userEvent.unhover(container)

  expect(popup).toBeInTheDocument()
})

test('the hover is disabled on touchscreen devices', async () => {
  Object.defineProperty(window, 'innerWidth', { get: () => 640 })

  render(<Popup referenceContent="open" popupContent="popup" openOnHover />)

  const reference = screen.getByRole('button')
  await userEvent.click(reference)

  const popup = screen.getByText('popup')
  expect(popup).toBeInTheDocument()

  await userEvent.click(reference)

  expect(popup).not.toBeInTheDocument()
})

test('the options are correctly defined', async () => {
  const props: Omit<PopupProps, 'referenceContent' | 'popupContent'> = {
    placement: 'bottom',
    strategy: 'fixed',
    onFirstUpdate: () => null,
    arrowPadding: 10,
    offset: [0, 1],
    preventOverflowOptions: { mainAxis: true },
    flipOptions: { altAxis: true },
    computeStylesOptions: { adaptive: true },
    eventListenersOptions: { scroll: true },
  }

  render(<Popup referenceContent="open" popupContent="popup" {...props} />)

  expect(usePopper).toHaveBeenNthCalledWith(1, null, null, {
    placement: props.placement,
    strategy: props.strategy,
    onFirstUpdate: props.onFirstUpdate,
    modifiers: [
      { name: 'offset', options: { offset: props.offset } },
      {
        name: 'arrow',
        options: { element: null, padding: props.arrowPadding },
      },
      { name: 'preventOverflow', options: props.preventOverflowOptions },
      { name: 'flip', options: props.flipOptions },
      { name: 'computeStyles', options: props.computeStylesOptions },
      { name: 'eventListeners', options: props.eventListenersOptions },
    ],
  })
})
