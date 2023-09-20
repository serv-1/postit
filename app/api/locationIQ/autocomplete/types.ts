export type LocationIQAutocompleteGetData = {
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
