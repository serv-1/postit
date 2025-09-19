import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('https://api.locationiq.com/v1/autocomplete', () => {
    return HttpResponse.json(
      [
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
      ],
      { status: 200 }
    )
  }),
]

export default handlers
