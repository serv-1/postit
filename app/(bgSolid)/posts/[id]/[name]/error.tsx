'use client'

import Button from 'components/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="grow bg-fuchsia-100 rounded-16 flex flex-col justify-center items-center mb-8 gap-y-16">
      <h1>{error.message}</h1>
      <Button color="primary" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  )
}
