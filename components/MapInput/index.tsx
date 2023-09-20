import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import err from 'utils/constants/errors'
import { NEXT_PUBLIC_LOCATION_IQ_TOKEN } from 'env/public'
import type { LocationIQAutocompleteGetData } from 'app/api/locationIQ/autocomplete/types'

interface Prediction {
  lat: number
  lon: number
  place: string
  address: string
  postAddress: string
}

interface MapInputProps {
  setLatLon: React.Dispatch<React.SetStateAction<[number, number] | undefined>>
}

export default function MapInput({ setLatLon }: MapInputProps) {
  const [predictions, setPredictions] = useState<Prediction[]>()
  const [error, setError] = useState<string>()
  const [activePredictionId, setActivePredictionId] = useState('prediction-0')
  const [isOpen, setIsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const count = useRef(0)
  const { register, setValue } = useFormContext()

  const onInput = async (e: FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value

    count.current++

    if (value.length > 200) {
      setError(err.ADDRESS_MAX)

      return
    } else if (count.current !== 2) {
      return
    } else if (count.current === 2 && !value.trim()) {
      count.current = 0

      return
    }

    count.current = 0

    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=${NEXT_PUBLIC_LOCATION_IQ_TOKEN}&dedupe=1&tag=place:city,town,village,hamlet&q=${value}`
    )

    if (!response.ok) {
      const { error }: { error: string } = await response.json()

      setError(error)

      return
    }

    const predictions: Prediction[] = []
    const data: LocationIQAutocompleteGetData = await response.json()

    for (const item of data) {
      const { lat, lon, address, display_address, display_place } = item
      const { name, postcode, county, state, country } = address
      const values: string[] = []

      if (name) values.push(name)
      if (postcode) values.push(postcode.split(';')[0])
      if (county) values.push(county)
      if (state) values.push(state)
      if (country) values.push(country)

      predictions.push({
        lat: +lat,
        lon: +lon,
        place: display_place,
        address: display_address,
        postAddress: values.join(', '),
      })
    }

    setPredictions(predictions)
    setIsOpen(true)
    setError(undefined)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!predictions) return

    const nbOfPredictions = predictions.length
    const idNb = +activePredictionId.split('-')[1]

    switch (e.key) {
      case 'ArrowDown': {
        const nb = idNb + 1

        setActivePredictionId('prediction-' + (nb === nbOfPredictions ? 0 : nb))

        break
      }
      case 'ArrowUp': {
        const nb = idNb - 1
        const id = 'prediction-' + (nb === -1 ? nbOfPredictions - 1 : nb)

        setActivePredictionId(id)

        break
      }
      case 'Tab':
      case 'Enter': {
        ;(e.target as HTMLInputElement).value = predictions[idNb].place

        setIsOpen(false)
        setLatLon([predictions[idNb].lat, predictions[idNb].lon])
        setValue('address', predictions[idNb].postAddress)

        e.preventDefault()

        break
      }
    }
  }

  return (
    <div className="absolute top-[10px] left-[54px] z-[999] w-[calc(100%-64px)] max-w-[360px] md:left-1/2 md:-translate-x-1/2">
      <input type="hidden" {...register('address')} />
      <input
        className="p-8 border-b-2 transition-colors duration-200 rounded outline-none bg-fuchsia-50 placeholder:text-fuchsia-900/50 w-full border-fuchsia-900/25 focus-within:border-fuchsia-900/75 text-base"
        ref={inputRef}
        type="text"
        name="address"
        onInput={onInput}
        onKeyDown={onKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={!!predictions && predictions.length > 0}
        aria-controls="predictionList"
        aria-activedescendant={activePredictionId}
        aria-label="Address"
      />
      {isOpen &&
        (error ? (
          <div
            role="alert"
            className="my-4 bg-rose-100 text-rose-600 font-bold p-8 text-base rounded shadow-[0_4px_4px_rgba(136,19,55,0.35)]"
          >
            {error}
          </div>
        ) : (
          predictions &&
          predictions.length > 0 && (
            <ul
              id="predictionList"
              role="listbox"
              aria-label="Predictions"
              className="my-4 shadow-[0_4px_4px_rgba(112,26,117,0.35)] rounded overflow-hidden"
            >
              {predictions.map((prediction, i) => {
                const id = 'prediction-' + i
                const className =
                  activePredictionId === id
                    ? 'bg-fuchsia-200'
                    : 'bg-fuchsia-100'

                return (
                  <li
                    id={id}
                    key={i}
                    className={className + ' py-4 px-4 pb-2 cursor-pointer'}
                    onMouseDown={(e) => {
                      if (!inputRef.current) return

                      inputRef.current.value = prediction.place

                      setLatLon([prediction.lat, prediction.lon])
                      setValue('address', prediction.postAddress)
                      setIsOpen(false)

                      e.preventDefault()
                    }}
                    role="option"
                    aria-selected={activePredictionId === id}
                  >
                    <div className="text-base">{prediction.place}</div>
                    <div className="text-s text-fuchsia-400 truncate">
                      {prediction.address}
                    </div>
                  </li>
                )
              })}
            </ul>
          )
        ))}
    </div>
  )
}
