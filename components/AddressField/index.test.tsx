import type { MapProps } from 'components/Map'
import AddressField, { type AddressFieldProps } from '.'
import type { Map } from 'leaflet'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import {
  NEXT_PUBLIC_LOCATION_IQ_TOKEN,
  NEXT_PUBLIC_LOCATION_IQ_URL,
} from 'env/public'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Form from 'components/Form'
import { useForm } from 'react-hook-form'
import { ADDRESS_REQUIRED } from 'constants/errors'

const server = setupServer()
const mockFlyTo = jest.fn()
const mockSetValue = jest.fn()
const url = NEXT_PUBLIC_LOCATION_IQ_URL + '/autocomplete'
const mockUseFormContext = jest.spyOn(
  require('react-hook-form'),
  'useFormContext'
)

function TestForm(props: AddressFieldProps) {
  const methods = useForm()

  return (
    <Form
      methods={methods}
      method="post"
      name="test"
      submitHandler={() => null}
    >
      <AddressField {...props} />
    </Form>
  )
}

jest.mock('components/Map', () => ({
  __esModule: true,
  default: ({ center, renderContent }: MapProps) => {
    const map = { flyTo: mockFlyTo } as unknown as Map

    return (
      <div data-testid="map" data-center={center}>
        {renderContent && renderContent(map)}
      </div>
    )
  },
}))

beforeEach(() => {
  mockUseFormContext.mockReturnValue({
    register: (n: any, o: any) => o,
    setValue: mockSetValue,
    formState: { errors: {} },
  })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders the options correctly', async () => {
  server.use(
    rest.get(url, (req, res, ctx) => {
      const { searchParams } = req.url

      expect(searchParams.get('key')).toBe(NEXT_PUBLIC_LOCATION_IQ_TOKEN)
      expect(searchParams.get('q')).toBe('a')

      return res(
        ctx.status(200),
        ctx.json([
          {
            place_id: '0',
            lat: 0,
            lon: 0,
            display_address: 'France',
            display_place: 'Paris',
          },
          {
            place_id: '1',
            lat: 0,
            lon: 0,
            display_address: 'France',
            display_place: 'Lyon',
          },
          {
            place_id: '2',
            lat: 0,
            lon: 0,
            display_address: 'France',
            display_place: 'Nice',
          },
        ])
      )
    })
  )

  render(<TestForm setLatLon={() => null} />)

  const input = screen.getByRole('combobox')

  await userEvent.type(input, 'a')

  const options = screen.getAllByRole('option')

  expect(options).toHaveLength(3)
  expect(options[0]).toHaveTextContent('Paris')
  expect(options[0]).toHaveTextContent('France')
  expect(options[1]).toHaveTextContent('Lyon')
  expect(options[1]).toHaveTextContent('France')
  expect(options[2]).toHaveTextContent('Nice')
  expect(options[2]).toHaveTextContent('France')
})

it('clears the options when the input is cleared', async () => {
  server.use(
    rest.get(url, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            place_id: '0',
            lat: 0,
            lon: 0,
            display_address: 'France',
            display_place: 'Paris',
          },
        ])
      )
    })
  )

  render(<TestForm setLatLon={() => null} />)

  const input = screen.getByRole('combobox')

  await userEvent.type(input, 'a')

  const option = screen.getByRole('option')

  await userEvent.clear(input)

  expect(option).not.toBeInTheDocument()
})

it("doesn't fetch the locations if the input value is greater than 200 characters", async () => {
  server.use(
    rest.get(url, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            place_id: '0',
            lat: 0,
            lon: 0,
            display_address: 'France',
            display_place: 'Paris',
          },
        ])
      )
    })
  )

  render(<TestForm setLatLon={() => null} />)

  const input = screen.getByRole<HTMLInputElement>('combobox')

  input.value = 'a'.repeat(200)

  await userEvent.type(input, 'a')

  const option = screen.queryByRole('option')

  expect(option).not.toBeInTheDocument()
})

it('sets the address and the latitude/longitude when an option is clicked', async () => {
  server.use(
    rest.get(url, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            place_id: '0',
            lat: 12.34,
            lon: 56.78,
            display_address: 'France',
            display_place: 'Paris',
          },
        ])
      )
    })
  )

  const mockSetLatLon = jest.fn()

  render(<TestForm setLatLon={mockSetLatLon} />)

  const input = screen.getByRole('combobox')

  await userEvent.type(input, 'a')

  const option = screen.getByRole('option')

  await userEvent.click(option)

  expect(mockSetValue).toHaveBeenNthCalledWith(1, 'address', 'Paris, France')
  expect(mockSetLatLon).toHaveBeenNthCalledWith(1, [12.34, 56.78])
})

it("flies to the clicked option's latitude and longitude on the map", async () => {
  server.use(
    rest.get(url, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            place_id: '0',
            lat: 12.34,
            lon: 56.78,
            display_address: 'France',
            display_place: 'Paris',
          },
        ])
      )
    })
  )

  const mockSetLatLon = jest.fn()

  render(<TestForm setLatLon={mockSetLatLon} />)

  const input = screen.getByRole('combobox')

  await userEvent.type(input, 'a')

  const option = screen.getByRole('option')

  await userEvent.click(option)

  expect(mockFlyTo).toHaveBeenNthCalledWith(1, [12.34, 56.78])
})

it('renders an error if the address is invalid', async () => {
  mockUseFormContext.mockReturnValue({
    register: jest.fn(),
    setValue: jest.fn(),
    formState: { errors: { address: { message: ADDRESS_REQUIRED } } },
  })

  server.use(
    rest.get(url, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            place_id: '0',
            lat: 12.34,
            lon: 56.78,
            display_address: 'France',
            display_place: 'Paris',
          },
        ])
      )
    })
  )

  render(<TestForm setLatLon={() => null} />)

  const input = screen.getByRole('combobox')

  await userEvent.type(input, 'a')

  const form = screen.getByRole<HTMLFormElement>('form')

  form.submit()

  const error = screen.getByRole('alert')

  expect(error).toHaveTextContent(ADDRESS_REQUIRED)
})
