import useWizard from 'hooks/useWizard'
import WizardProvider from '.'
import { useEffect, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function TestStep({ id }: { id: string }) {
  const { activeStepId, addStep, removeStep } = useWizard()

  useEffect(() => {
    addStep(id)

    return () => {
      removeStep(id)
    }
  }, [addStep, removeStep, id])

  return activeStepId === id ? <h2>step {id}</h2> : null
}

function TestPrevButton() {
  const { prevStep } = useWizard()

  return <button onClick={prevStep}>prev</button>
}

function TestNextButton() {
  const { nextStep } = useWizard()

  return <button onClick={nextStep}>next</button>
}

function TestWizard() {
  return (
    <WizardProvider>
      <TestStep id="1" />
      <TestStep id="2" />
      <TestStep id="3" />
      <TestPrevButton />
      <TestNextButton />
    </WizardProvider>
  )
}

it('renders the first step', () => {
  render(<TestWizard />)

  const firstStep = screen.getByRole('heading', { level: 2, name: 'step 1' })

  expect(firstStep).toBeInTheDocument()
})

it('renders the next step', async () => {
  render(<TestWizard />)

  const nextBtn = screen.getByRole('button', { name: 'next' })

  await userEvent.click(nextBtn)

  const secondStep = screen.getByRole('heading', { level: 2, name: 'step 2' })

  expect(secondStep).toBeInTheDocument()

  await userEvent.click(nextBtn)

  const thirdStep = screen.getByRole('heading', { level: 2, name: 'step 3' })

  expect(thirdStep).toBeInTheDocument()
})

it('renders the previous step', async () => {
  render(<TestWizard />)

  const nextBtn = screen.getByRole('button', { name: 'next' })

  await userEvent.click(nextBtn)
  await userEvent.click(nextBtn)

  const prevBtn = screen.getByRole('button', { name: 'prev' })

  await userEvent.click(prevBtn)

  const secondStep = screen.getByRole('heading', { level: 2, name: 'step 2' })

  expect(secondStep).toBeInTheDocument()

  await userEvent.click(prevBtn)

  const firstStep = screen.getByRole('heading', { level: 2, name: 'step 1' })

  expect(firstStep).toBeInTheDocument()
})

test('the first step is a dead-end', async () => {
  render(<TestWizard />)

  const prevBtn = screen.getByRole('button', { name: 'prev' })

  await userEvent.click(prevBtn)

  const firstStep = screen.getByRole('heading', { level: 2, name: 'step 1' })

  expect(firstStep).toBeInTheDocument()
})

test('the last step is a dead-end', async () => {
  render(<TestWizard />)

  const nextBtn = screen.getByRole('button', { name: 'next' })

  await userEvent.click(nextBtn)
  await userEvent.click(nextBtn)
  await userEvent.click(nextBtn)

  const lastStep = screen.getByRole('heading', { level: 2, name: 'step 3' })

  expect(lastStep).toBeInTheDocument()
})

it('renders the next step of the unmounted step', async () => {
  function TestWizard() {
    const [isDeleted, setIsDeleted] = useState(false)

    return (
      <WizardProvider>
        <TestStep id="1" />
        {isDeleted || <TestStep id="2" />}
        <TestStep id="3" />
        <TestPrevButton />
        <TestNextButton />
        <button onClick={() => setIsDeleted(true)}>delete</button>
      </WizardProvider>
    )
  }

  render(<TestWizard />)

  const nextBtn = screen.getByRole('button', { name: 'next' })

  await userEvent.click(nextBtn)

  const deleteBtn = screen.getByRole('button', { name: 'delete' })

  await userEvent.click(deleteBtn)

  const thirdStep = screen.getByRole('heading', { level: 2, name: 'step 3' })

  expect(thirdStep).toBeInTheDocument()
})

it('renders the previous step of the unmounted last step', async () => {
  function TestWizard() {
    const [isDeleted, setIsDeleted] = useState(false)

    return (
      <WizardProvider>
        <TestStep id="1" />
        <TestStep id="2" />
        {isDeleted || <TestStep id="3" />}
        <TestPrevButton />
        <TestNextButton />
        <button onClick={() => setIsDeleted(true)}>delete</button>
      </WizardProvider>
    )
  }

  render(<TestWizard />)

  const nextBtn = screen.getByRole('button', { name: 'next' })

  await userEvent.click(nextBtn)
  await userEvent.click(nextBtn)

  const deleteBtn = screen.getByRole('button', { name: 'delete' })

  await userEvent.click(deleteBtn)

  const secondStep = screen.getByRole('heading', { level: 2, name: 'step 2' })

  expect(secondStep).toBeInTheDocument()
})
