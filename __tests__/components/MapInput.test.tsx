import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import MapInput from '../../components/MapInput'
import handlers from '../../mocks/locationiq/autocomplete'
import server from '../../mocks/server'
import err from '../../utils/constants/errors'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders the prediction list each times the input value has been modified 2 times', async () => {
  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  expect(input).toHaveAttribute('aria-expanded', 'false')
  await userEvent.type(input, 'a')

  const predictionList = screen.queryByRole('listbox')
  expect(predictionList).not.toBeInTheDocument()

  await userEvent.type(input, 'a')

  const predictions = await screen.findAllByRole('option')

  expect(predictions[0]).toHaveTextContent(/empire state building/i)
  expect(predictions[0]).toHaveTextContent(/united states/i)
  expect(predictions[0]).toHaveAttribute('id', 'prediction-0')
  expect(predictions[0]).toHaveAttribute('aria-selected', 'true')
  expect(predictions[0]).toHaveClass('bg-fuchsia-200')

  expect(predictions[1]).toHaveTextContent(/eiffel tower/i)
  expect(predictions[1]).toHaveTextContent(/france/i)
  expect(predictions[1]).toHaveAttribute('id', 'prediction-1')
  expect(predictions[1]).toHaveAttribute('aria-selected', 'false')
  expect(predictions[1]).toHaveClass('bg-fuchsia-100')

  expect(input).toHaveAttribute('aria-expanded', 'true')
  expect(input).toHaveAttribute('aria-activedescendant', 'prediction-0')
})

it("doesn't render the prediction list if the query is empty or composed of white spaces", async () => {
  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'a')

  await userEvent.keyboard('{Backspace}')
  await expect(screen.findByRole('listbox')).rejects.toThrow()

  input.value = ''
  await userEvent.type(input, '  ')
  await expect(screen.findByRole('listbox')).rejects.toThrow()
})

it('renders an error if the server fails to fetch the predictions', async () => {
  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  const predictionList = await screen.findByRole('listbox')
  expect(predictionList).toBeInTheDocument()

  server.use(
    rest.get(
      'https://api.locationiq.com/v1/autocomplete.php',
      (req, res, ctx) =>
        res(ctx.status(400), ctx.json({ error: 'Invalid request' }))
    )
  )

  await userEvent.type(input, 'bb')

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Invalid request')
  expect(predictionList).not.toBeInTheDocument()
})

it('renders an error if the server send no response', async () => {
  const axiosGet = jest.spyOn(require('axios'), 'get')
  axiosGet.mockRejectedValue({})

  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.NO_RESPONSE)

  axiosGet.mockRestore()
})

it('removes the error if the predictions are about to be fetched again', async () => {
  server.use(
    rest.get(
      'https://api.locationiq.com/v1/autocomplete.php',
      (req, res, ctx) => res(ctx.status(400), ctx.json({ error: 'error' }))
    )
  )

  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  const alert = await screen.findByRole('alert')
  expect(alert).toBeInTheDocument()

  server.use(handlers[0])

  await userEvent.type(input, 'bb')

  const predictionList = await screen.findByRole('listbox')
  expect(predictionList).toBeInTheDocument()
  expect(alert).not.toBeInTheDocument()
})

test('arrow up/down moves the visual focus between each options', async () => {
  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  const predictions = await screen.findAllByRole('option')
  await userEvent.keyboard('{ArrowDown}')

  expect(input).toHaveAttribute('aria-activedescendant', 'prediction-1')
  expect(predictions[0]).toHaveClass('bg-fuchsia-100')
  expect(predictions[0]).toHaveAttribute('aria-selected', 'false')
  expect(predictions[1]).toHaveClass('bg-fuchsia-200')
  expect(predictions[1]).toHaveAttribute('aria-selected', 'true')

  await userEvent.keyboard('{ArrowDown}')

  expect(input).toHaveAttribute('aria-activedescendant', 'prediction-0')
  expect(predictions[0]).toHaveClass('bg-fuchsia-200')
  expect(predictions[0]).toHaveAttribute('aria-selected', 'true')
  expect(predictions[1]).toHaveClass('bg-fuchsia-100')
  expect(predictions[1]).toHaveAttribute('aria-selected', 'false')

  await userEvent.keyboard('{ArrowUp}')

  expect(input).toHaveAttribute('aria-activedescendant', 'prediction-1')
  expect(predictions[0]).toHaveClass('bg-fuchsia-100')
  expect(predictions[0]).toHaveAttribute('aria-selected', 'false')
  expect(predictions[1]).toHaveClass('bg-fuchsia-200')
  expect(predictions[1]).toHaveAttribute('aria-selected', 'true')

  await userEvent.keyboard('{ArrowUp}')

  expect(input).toHaveAttribute('aria-activedescendant', 'prediction-0')
  expect(predictions[0]).toHaveClass('bg-fuchsia-200')
  expect(predictions[0]).toHaveAttribute('aria-selected', 'true')
  expect(predictions[1]).toHaveClass('bg-fuchsia-100')
  expect(predictions[1]).toHaveAttribute('aria-selected', 'false')
})

test('tab, enter or clicking a prediction assigns its value to the input value and unmounts the prediction list', async () => {
  const prediction1LatLon = [40, -73]
  const prediction2LatLon = [48, 22]

  const setLatLon = jest.fn()
  render(<MapInput setLatLon={setLatLon} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  let predictionList = await screen.findByRole('listbox')
  await userEvent.tab()
  expect(setLatLon).toHaveBeenNthCalledWith(1, prediction1LatLon)
  expect(predictionList).not.toBeInTheDocument()

  await userEvent.type(input, 'bb')
  predictionList = await screen.findByRole('listbox')
  await userEvent.keyboard('{ArrowDown}')
  await userEvent.keyboard('{Enter}')
  expect(setLatLon).toHaveBeenNthCalledWith(2, prediction2LatLon)
  expect(predictionList).not.toBeInTheDocument()

  await userEvent.type(input, 'cc')
  const prediction = (await screen.findAllByRole('option'))[0]
  await userEvent.click(prediction)
  expect(setLatLon).toHaveBeenNthCalledWith(3, prediction1LatLon)
  expect(prediction).not.toBeInTheDocument()
  expect(input).toHaveFocus()
})

test("the prediction list doesn't render if there is 0 prediction", async () => {
  server.use(
    rest.get(
      'https://api.locationiq.com/v1/autocomplete.php',
      (req, res, ctx) => res(ctx.status(200), ctx.json([]))
    )
  )

  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  await expect(screen.findByRole('listbox')).rejects.toThrow()
})

it('renders/unmounts the prediction list if the input is focused in/out', async () => {
  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  let predictionList = await screen.findByRole('listbox')
  expect(predictionList).toBeInTheDocument()

  await userEvent.click(document.body)
  expect(predictionList).not.toBeInTheDocument()

  await userEvent.click(input)

  predictionList = screen.getByRole('listbox')
  expect(predictionList).toBeInTheDocument()
})

it('renders/unmounts the error if the input is focused in/out', async () => {
  server.use(
    rest.get(
      'https://api.locationiq.com/v1/autocomplete.php',
      (req, res, ctx) => res(ctx.status(400), ctx.json({ error: 'error' }))
    )
  )

  render(<MapInput setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')
  await userEvent.type(input, 'aa')

  let alert = await screen.findByRole('alert')
  expect(alert).toBeInTheDocument()

  await userEvent.click(document.body)
  expect(alert).not.toBeInTheDocument()

  await userEvent.click(input)

  alert = screen.getByRole('alert')
  expect(alert).toBeInTheDocument()
})
