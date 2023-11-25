import WizardStep from '.'
import { render, screen } from '@testing-library/react'
import WizardProvider from 'components/WizardProvider'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'

it("uses the given class names if it's active", () => {
  render(
    <WizardProvider>
      <WizardStep className="step-1">Step 1</WizardStep>
    </WizardProvider>
  )

  const firstStep = screen.getByText('Step 1')

  expect(firstStep).toHaveClass('step-1')
  expect(firstStep).not.toHaveClass('hidden')
})

it("is hidden if it isn't active", () => {
  render(
    <WizardProvider>
      <WizardStep className="step-1">Step 1</WizardStep>
      <WizardStep className="step-2">Step 2</WizardStep>
    </WizardProvider>
  )

  const secondStep = screen.getByText('Step 2')

  expect(secondStep).toHaveClass('hidden')
  expect(secondStep).not.toHaveClass('step-2')
})

it("removes itself from the WizardProvider if it's unmounted", async () => {
  function TestWizard() {
    const [isDeleted, setIsDeleted] = useState(false)

    return (
      <WizardProvider>
        {isDeleted || <WizardStep className="step-1">Step 1</WizardStep>}
        <WizardStep className="step-2">Step 2</WizardStep>
        <button onClick={() => setIsDeleted(true)}>Delete</button>
      </WizardProvider>
    )
  }

  render(<TestWizard />)

  const firstStep = screen.getByText('Step 1')

  expect(firstStep).toHaveClass('step-1')

  const secondStep = screen.getByText('Step 2')

  expect(secondStep).toHaveClass('hidden')

  const deleteBtn = screen.getByRole('button')

  await userEvent.click(deleteBtn)

  expect(firstStep).not.toBeInTheDocument()
  expect(secondStep).toHaveClass('step-2')
})
