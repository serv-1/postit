import { type FormEvent, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  NEXT_PUBLIC_LOCATION_IQ_TOKEN,
  NEXT_PUBLIC_LOCATION_IQ_URL,
} from 'env/public'
import type { LocationIQAutocompleteGetData } from 'app/api/locationIQ/autocomplete/types'
import Autocomplete from 'components/Autocomplete'
import Map from 'components/Map'

interface Option {
  id: string
  lat: number
  lon: number
  place: string
  address: string
  postAddress: string
}

export interface AddressFieldProps {
  className?: string
  setLatLon: React.Dispatch<React.SetStateAction<[number, number] | undefined>>
  center?: [number, number]
}

export default function AddressField({
  className,
  setLatLon,
  center,
}: AddressFieldProps) {
  const [options, setOptions] = useState<Option[]>([])
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  async function onChange(e: FormEvent<HTMLInputElement>) {
    const value = (e.target as HTMLInputElement).value.trim()

    if (!value.length) {
      setLatLon(undefined)
      setOptions([])

      return
    } else if (value.length > 200) {
      return
    }

    const searchParams = new URLSearchParams({
      key: NEXT_PUBLIC_LOCATION_IQ_TOKEN,
      dedupe: '1',
      tag: 'place:city,town,village,hamlet',
      q: value,
    })

    const response = await fetch(
      NEXT_PUBLIC_LOCATION_IQ_URL + '/autocomplete?' + searchParams
    )

    if (response.ok) {
      const options: Option[] = []

      for (const {
        place_id,
        lat,
        lon,
        display_address,
        display_place,
      } of (await response.json()) as LocationIQAutocompleteGetData) {
        options.push({
          id: place_id,
          lat: +lat,
          lon: +lon,
          place: display_place,
          address: display_address,
          postAddress: display_place + ', ' + display_address,
        })
      }

      setOptions(options)
    }
  }

  return (
    <Map
      className={className}
      zoom={12}
      center={center}
      renderContent={(map) => (
        <Autocomplete
          className="absolute z-[9999] w-full p-4 md:p-8"
          options={options}
          error={errors.address?.message as string}
          renderInput={(props) => (
            <input
              {...props}
              {...register('address', { onChange })}
              placeholder="Paris, France"
            />
          )}
          renderOption={(props, option) => (
            <li
              key={option.id}
              {...props}
              onClick={(e) => {
                props.onClick(e)
                setValue('address', option.postAddress)
                setLatLon([option.lat, option.lon])
                map.flyTo([option.lat, option.lon])
              }}
            >
              <div className="text-base">{option.place}</div>
              <div className="text-s text-fuchsia-400 truncate">
                {option.address}
              </div>
            </li>
          )}
        />
      )}
    />
  )
}
