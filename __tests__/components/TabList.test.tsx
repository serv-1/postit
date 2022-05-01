import TabList from '../../components/TabList'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('renders', () => {
  render(<TabList className="red">Insert tabs here</TabList>)

  const tabList = screen.getByRole('tablist')
  expect(tabList).toHaveClass('red')
  expect(tabList).toHaveTextContent('Insert tabs here')
})

it('arrow left and arrow right are used to navigate between tabs', async () => {
  render(
    <TabList>
      <button role="tab" tabIndex={0}>
        Tab 1
      </button>
      <button role="tab" tabIndex={-1}>
        Tab 2
      </button>
      <button role="tab" tabIndex={-1}>
        Tab 3
      </button>
    </TabList>
  )

  const firstTab = screen.getByRole('tab', { name: /1/i })
  const lastTab = screen.getByRole('tab', { name: /3/i })

  // https://github.com/testing-library/user-event/issues/901
  await userEvent.click(firstTab)

  await userEvent.keyboard('{ArrowLeft}')
  expect(firstTab).toHaveAttribute('tabindex', '-1')
  expect(lastTab).toHaveAttribute('tabindex', '0')
  expect(lastTab).toHaveFocus()

  await userEvent.keyboard('{ArrowRight}')
  expect(firstTab).toHaveAttribute('tabindex', '0')
  expect(firstTab).toHaveFocus()
  expect(lastTab).toHaveAttribute('tabindex', '-1')
})
