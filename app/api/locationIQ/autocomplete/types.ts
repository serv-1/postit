export type LocationIQAutocompleteGetData = {
  place_id: string
  lat: string
  lon: string
  display_place: string
  display_address: string
  address: {
    name?: string
    city?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
}[]

export interface LocationIQAutocompleteGetError {
  error: string
}
