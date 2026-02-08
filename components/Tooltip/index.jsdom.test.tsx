import setup from 'functions/setup'
import Tooltip from '.'
import { screen } from '@testing-library/dom'

it('is closed by default', () => {
  setup(
    <Tooltip renderReference={(props) => <button {...props}></button>}>
      Content
    </Tooltip>
  )

  const tooltip = screen.queryByRole('tooltip')
  expect(tooltip).not.toBeInTheDocument()
})

it('opens and closes on hover', async () => {
  const { user } = setup(
    <Tooltip renderReference={(props) => <button {...props}></button>}>
      Content
    </Tooltip>
  )

  const button = screen.getByRole('button')
  await user.hover(button)

  const tooltip = screen.getByRole('tooltip')
  expect(tooltip).toBeInTheDocument()

  await user.unhover(button)
  expect(tooltip).not.toBeInTheDocument()
})

it('opens and closes on focus', async () => {
  const { user } = setup(
    <Tooltip renderReference={(props) => <button {...props}></button>}>
      Content
    </Tooltip>
  )

  await user.tab()

  const tooltip = screen.getByRole('tooltip')
  expect(tooltip).toBeInTheDocument()

  await user.tab()
  expect(tooltip).not.toBeInTheDocument()
})

it('closes on "Escape" key press', async () => {
  const { user } = setup(
    <Tooltip renderReference={(props) => <button {...props}></button>}>
      Content
    </Tooltip>
  )

  const button = screen.getByRole('button')
  await user.hover(button)
  await user.keyboard('{Escape}')

  const tooltip = screen.queryByRole('tooltip')
  expect(tooltip).not.toBeInTheDocument()
})
