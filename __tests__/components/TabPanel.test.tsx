import TabPanel from '../../components/TabPanel'
import { render, screen } from '@testing-library/react'

const useTabs = jest.spyOn(require('../../contexts/tabs'), 'useTabs')

it('is hidden', () => {
  useTabs.mockReturnValue({ activeTab: 'no' })

  render(<TabPanel value="yes">Hidden</TabPanel>)

  const tabPanel = screen.getByRole('tabpanel')
  expect(tabPanel).toHaveClass('hidden')
})

it('is visible', () => {
  useTabs.mockReturnValue({ activeTab: 'yes' })

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
