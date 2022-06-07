import { rest } from 'msw'

const handlers = [
  rest.get(
    'https://api.locationiq.com/v1/autocomplete.php',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            lat: '59',
            lon: '10',
            type: 'city',
            display_place: 'Oslo',
            display_address: 'Norway',
            address: {
              name: 'Oslo',
              country: 'Norway',
            },
          },
          {
            lat: '48',
            lon: '2',
            type: 'city',
            display_place: 'Paris',
            display_address: 'Ile-de-France, France',
            address: {
              name: 'Paris',
              state: 'Ile-de-France',
              country: 'France',
            },
          },
        ])
      )
    }
  ),
]

export default handlers
