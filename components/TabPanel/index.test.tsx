import TabPanel from '.'
import { render, screen } from '@testing-library/react'
import useTabs from 'hooks/useTabs'

jest.mock('hooks/useTabs', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockUseTabs = useTabs as jest.MockedFunction<typeof useTabs>

it('is hidden', () => {
  mockUseTabs.mockReturnValue({ activeTab: 'no', setActiveTab() {} })

  render(<TabPanel value="yes">Hidden</TabPanel>)

  const tabPanel = screen.getByRole('tabpanel')
  expect(tabPanel).toHaveClass('hidden')
})

it('is visible', () => {
  mockUseTabs.mockReturnValue({ activeTab: 'yes', setActiveTab() {} })

  render(
    <TabPanel value="yes" className="red">
      Visible
    </TabPanel>
  )

  const tabPanel = screen.getByRole('tabpanel')
  expect(tabPanel).toHaveAttribute('id', 'yes-panel')
  expect(tabPanel).toHaveAttribute('aria-labelledby', 'yes-tab')
  expect(tabPanel).toHaveClass('red', 'block')
  expect(tabPanel).toHaveTextContent('Visible')
})
