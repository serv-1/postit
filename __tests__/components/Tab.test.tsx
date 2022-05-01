import { render, screen } from '@testing-library/react'
import Tab from '../../components/Tab'
import userEvent from '@testing-library/user-event'

const useTabs = jest.spyOn(require('../../contexts/tabs'), 'useTabs')

beforeEach(() => useTabs.mockReturnValue({}))

it('renders', () => {
  render(
    <Tab value="test" activeClass="red" inactiveClass="blue" baseClass="black">
      Test
    </Tab>
  )

  const tab = screen.getByRole('tab')
  expect(tab).toHaveAttribute('tabindex', '-1')
  expect(tab).toHaveAttribute('aria-selected', 'false')
  expect(tab).toHaveAttribute('aria-controls', 'test-panel')
  expect(tab).toHaveAttribute('id', 'test-tab')
  expect(tab).not.toHaveClass('red')
  expect(tab).toHaveClass('blue', 'black')
})

it('renders as an active tab', () => {
  useTabs.mockReturnValue({ activeTab: 'test' })

  render(
    <Tab value="test" activeClass="red" inactiveClass="blue" baseClass="black">
      Test
    </Tab>
  )

  const tab = screen.getByRole('tab')
  expect(tab).toHaveAttribute('tabindex', '0')
  expect(tab).toHaveAttribute('aria-selected', 'true')
  expect(tab).not.toHaveClass('blue', 'black')
  expect(tab).toHaveClass('red')
})

it('becomes the active tabs on click', async () => {
  const setActiveTab = jest.fn()
  useTabs.mockReturnValue({ setActiveTab })

  render(
    <Tab value="test" activeClass="red">
      Test
    </Tab>
  )

  const tab = screen.getByRole('tab')
  await userEvent.click(tab)

  expect(setActiveTab).toHaveBeenCalledTimes(1)
})
