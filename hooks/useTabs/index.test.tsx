import { render } from '@testing-library/react'
import useTabs from '.'
import TabsProvider from 'components/TabsProvider'

it('return the context', () => {
  function Test() {
    expect(useTabs()).not.toBeUndefined()

    return null
  }

  render(
    <TabsProvider>
      <Test />
    </TabsProvider>
  )
})

it('throws an error if it is used outside of the TabsProvider', () => {
  expect(() => useTabs()).toThrow()
})
