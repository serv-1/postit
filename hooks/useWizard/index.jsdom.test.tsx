import { render } from '@testing-library/react'
import useWizard from '.'
import WizardProvider from 'components/WizardProvider'

it('returns the context', () => {
  function Test() {
    expect(useWizard()).not.toBeUndefined()

    return null
  }

  render(
    <WizardProvider>
      <Test />
    </WizardProvider>
  )
})

it('throws an error if it is used outside of the WizardProvider', () => {
  expect(() => useWizard()).toThrow()
})
