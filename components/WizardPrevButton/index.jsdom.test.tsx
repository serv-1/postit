import useWizard from 'hooks/useWizard'
import WizardPrevButton from '.'
import { render, screen } from '@testing-library/react'
import WizardProvider from 'components/WizardProvider'
import { useEffect } from 'react'
import userEvent from '@testing-library/user-event'

function TestNextButton() {
  const { nextStep } = useWizard()

  return <button onClick={nextStep}>next</button>
}

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
      <WizardPrevButton className="test">prev</WizardPrevButton>
    </WizardProvider>
  )

  const prevBtn = screen.getByRole('button')

  expect(prevBtn).toHaveClass('test')
})

it('is disabled if the active step is the first step', () => {
  render(
    <WizardProvider>
      <TestStep id="1" />
      <WizardPrevButton>prev</WizardPrevButton>
    </WizardProvider>
  )

  const prevBtn = screen.getByRole('button')

  expect(prevBtn).toBeDisabled()
})

it("isn't disabled if the active step isn't the first step", async () => {
  render(
    <WizardProvider>
      <TestStep id="1" />
      <TestStep id="2" />
      <WizardPrevButton>prev</WizardPrevButton>
      <TestNextButton />
    </WizardProvider>
  )

  const nextBtn = screen.getByRole('button', { name: 'next' })

  await userEvent.click(nextBtn)

  const prevBtn = screen.getByRole('button', { name: 'prev' })

  expect(prevBtn).toBeEnabled()
})

it('renders the previous step on click', async () => {
  render(
    <WizardProvider>
      <TestStep id="1" />
      <TestStep id="2" />
      <WizardPrevButton>prev</WizardPrevButton>
      <TestNextButton />
    </WizardProvider>
  )

  const nextBtn = screen.getByRole('button', { name: 'next' })

  await userEvent.click(nextBtn)

  const prevBtn = screen.getByRole('button', { name: 'prev' })

  await userEvent.click(prevBtn)

  const firstStep = screen.getByRole('heading', { level: 2, name: 'step 1' })

  expect(firstStep).toBeInTheDocument()
})
