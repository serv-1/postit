import { useEffect } from 'react'

export default function useLinearBackgroundGradient() {
  useEffect(() => {
    document.body.classList.add('bg-linear-page')

    return () => document.body.classList.remove('bg-linear-page')
  }, [])
}
