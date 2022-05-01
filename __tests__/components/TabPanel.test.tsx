import TabPanel from '../../components/TabPanel'
import { render, screen } from '@testing-library/react'

const useTabs = jest.spyOn(require('../../contexts/tabs'), 'useTabs')

it("doesn't render", () => {
  useTabs.mockReturnValue({ activeTab: 'no' })

  render(<TabPanel value="yes">Hidden</TabPanel>)

  const tabPanel = screen.queryByRole('tabpanel')
  expect(tabPanel).not.toBeInTheDocument()
})

it('renders', () => {
  useTabs.mockReturnValue({ activeTab: 'yes' })

  render(
    <TabPanel value="yes" className="red">
      Visible
    </TabPanel>
  )

  const tabPanel = screen.getByRole('tabpanel')
  expect(tabPanel).toHaveAttribute('id', 'yes-panel')
  expect(tabPanel).toHaveAttribute('aria-labelledby', 'yes-tab')
  expect(tabPanel).toHaveClass('red')
  expect(tabPanel).toHaveTextContent('Visible')
})
