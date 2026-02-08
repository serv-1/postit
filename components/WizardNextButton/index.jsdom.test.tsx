import { render, screen } from '@testing-library/react'
import WizardNextButton from '.'
import WizardProvider from 'components/WizardProvider'
import useWizard from 'hooks/useWizard'
import { useEffect } from 'react'
import userEvent from '@testing-library/user-event'

function TestStep({ id }: { id: string }) {
  const { activeStepId, addStep } = useWizard()

  useEffect(() => {
    addStep(id)
  }, [addStep, id])

  return activeStepId === id ? <h2>step {id}</h2> : null
}

it('uses the given class names', () => {
  render(
    <WizardProvider>
      <WizardNextButton className="test">next</WizardNextButton>
    </WizardProvider>
  )

  const nextBtn = screen.getByRole('button')

  expect(nextBtn).toHaveClass('test')
})

it('is disabled if the active step is the last step', () => {
  render(
    <WizardProvider>
      <TestStep id="1" />
      <WizardNextButton>next</WizardNextButton>
    </WizardProvider>
  )

  const nextBtn = screen.getByRole('button')

  expect(nextBtn).toBeDisabled()
})

it('is disabled if the given "isDisabled" prop is true', () => {
  render(
    <WizardProvider>
      <TestStep id="1" />
      <TestStep id="2" />
      <WizardNextButton isDisabled>next</WizardNextButton>
    </WizardProvider>
  )

  const nextBtn = screen.getByRole('button')

  expect(nextBtn).toBeDisabled()
})

it('renders the next step on click', async () => {
  render(
    <WizardProvider>
      <TestStep id="1" />
      <TestStep id="2" />
      <WizardNextButton>next</WizardNextButton>
    </WizardProvider>
  )

  const nextBtn = screen.getByRole('button')

  await userEvent.click(nextBtn)

  const secondStep = screen.getByRole('heading', { level: 2, name: 'step 2' })

  expect(secondStep).toBeInTheDocument()
})
