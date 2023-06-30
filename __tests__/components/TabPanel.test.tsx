import TabPanel from '../../components/TabPanel'
import { render, screen } from '@testing-library/react'
import { useTabs } from '../../contexts/tabs'

jest.mock('../../contexts/Tabs', () => ({
  useTabs: jest.fn(),
}))

const useTabsMock = useTabs as jest.MockedFunction<typeof useTabs>

it('is hidden', () => {
  useTabsMock.mockReturnValue({ activeTab: 'no', setActiveTab() {} })

  render(<TabPanel value="yes">Hidden</TabPanel>)

  const tabPanel = screen.getByRole('tabpanel')
  expect(tabPanel).toHaveClass('hidden')
})

it('is visible', () => {
  useTabsMock.mockReturnValue({ activeTab: 'yes', setActiveTab() {} })

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
