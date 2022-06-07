import { rest } from 'msw'

const handlers = [
  rest.get(
    'https://api.locationiq.com/v1/autocomplete.php',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            place_id: '0',
            osm_id: '34633854',
            osm_type: 'way',
            licence: 'https://locationiq.com/attribution',
            lat: '40',
            lon: '-73',
            boundingbox: [
              '40.7479226',
              '40.7489422',
              '-73.9864855',
              '-73.9848259',
            ],
            class: 'tourism',
            type: 'attraction',
            display_name: 'Empire State Building, US',
            display_place: 'Empire State Building',
            display_address:
              '350, 5th Avenue, New York City, New York, 10018, United States of America',
            address: {
              name: 'Empire State Building',
              house_number: '350',
              road: '5th Avenue',
              city: 'New York City',
              state: 'New York',
              postcode: '10018',
              country: 'United States of America',
            },
          },
          {
            place_id: '323299226737',
            osm_id: '5013364',
            osm_type: 'way',
            licence: 'https://locationiq.com/attribution',
            lat: '48',
            lon: '22',
            boundingbox: ['48.8574753', '48.8590453', '2.2933084', '2.2956897'],
            class: 'tourism',
            type: 'attraction',
            display_name: 'Eiffel Tower, France',
            display_place: 'Eiffel Tower',
            display_address:
              '5, Avenue Anatole France, Quartier du Gros-Caillou, Paris, Paris, Ile-de-France, 75007, France',
            address: {
              name: 'Eiffel Tower',
              house_number: '5',
              road: 'Avenue Anatole France',
              neighbourhood: 'Quartier du Gros-Caillou',
              suburb: 'Paris',
              city: 'Paris',
              state: 'Ile-de-France',
              postcode: '75007',
              country: 'France',
              country_code: 'fr',
            },
          },
        ])
      )
    }
  ),
]

export default handlers
