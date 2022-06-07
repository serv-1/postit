import axios, { AxiosError } from 'axios'
import { FormEvent, KeyboardEvent, useRef, useState } from 'react'
import err from '../utils/constants/errors'

interface Prediction {
  lat: number
  lon: number
  place: string
  address: string
}

type AutoCompleteResponse = {
  lat: string
  lon: string
  display_place: string
  display_address: string
}[]

interface MapInputProps {
  setLatLon: React.Dispatch<React.SetStateAction<[number, number] | undefined>>
}

const MapInput = ({ setLatLon }: MapInputProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>()
  const [error, setError] = useState<string>()
  const [activePredictionId, setActivePredictionId] = useState('prediction-0')
  const [isOpen, setIsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const count = useRef(0)

  const onInput = async (e: FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value
    count.current++

    if (count.current !== 2) {
      return
    } else if (count.current === 2 && !value.trim()) {
      count.current = 0
      return
    }

    try {
      const res = await axios.get<AutoCompleteResponse>(
        `https://api.locationiq.com/v1/autocomplete.php?key=pk.956a05610e523c7773a4307bbd557cf4&dedupe=1&q=${value}`
      )

      const predictions: Prediction[] = []

      for (const { lat, lon, display_place, display_address } of res.data) {
        predictions.push({
          lat: +lat,
          lon: +lon,
          place: display_place,
          address: display_address,
        })
      }

      setPredictions(predictions)
      setIsOpen(true)
      setError(undefined)
    } catch (e) {
      const res = (e as AxiosError<{ error: string }>).response

      if (!res) {
        return setError(err.NO_RESPONSE)
      }

      setError(res.data.error)
    } finally {
      count.current = 0
    }
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
        e.preventDefault()
        break
      }
    }
  }

  return (
    <div className="absolute top-[10px] left-[54px] z-[999] w-[calc(100%-64px)] max-w-[360px] md:left-1/2 md:-translate-x-1/2">
      <input
        className="p-8 border-b-2 transition-colors duration-200 rounded outline-none bg-fuchsia-50 placeholder:text-fuchsia-900/50 w-full border-fuchsia-900/25 focus-within:border-fuchsia-900/75 text-base"
        ref={inputRef}
        type="text"
        name="location"
        onInput={onInput}
        onKeyDown={onKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={!!predictions && predictions.length > 0}
        aria-controls="predictionList"
        aria-activedescendant={activePredictionId}
        aria-label="Location"
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

export default MapInput
