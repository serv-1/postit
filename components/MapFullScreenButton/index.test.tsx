import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapFullScreenButton from '.'

it("renders the full screen button if the map isn't in full screen", () => {
  render(<MapFullScreenButton fullScreen={false} setFullScreen={() => null} />)

  const fullScreenBtn = screen.getByRole('button')

  expect(fullScreenBtn).toHaveAccessibleName('Full screen')
})

it('renders the minimize button if the map is in full screen', () => {
  render(<MapFullScreenButton fullScreen={true} setFullScreen={() => null} />)

  const minimizeBtn = screen.getByRole('button')

  expect(minimizeBtn).toHaveAccessibleName('Minimize')
})

it('displays the map in full screen on click on the full screen button', async () => {
  const setFullScreen = jest.fn()

  render(
    <MapFullScreenButton fullScreen={false} setFullScreen={setFullScreen} />
  )

  const fullScreenBtn = screen.getByRole('button')

  await userEvent.click(fullScreenBtn)

  expect(setFullScreen).toHaveBeenNthCalledWith(1, true)
})

it('minimizes the map on click on the minimize button', async () => {
  const setFullScreen = jest.fn()

  render(
    <MapFullScreenButton fullScreen={true} setFullScreen={setFullScreen} />
  )

  const minimizeBtn = screen.getByRole('button')

  await userEvent.click(minimizeBtn)

  expect(setFullScreen).toHaveBeenNthCalledWith(1, false)
})
