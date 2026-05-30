'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="grow bg-fuchsia-50 rounded-2xl mb-8 flex flex-col justify-center items-center gap-y-16 shadow-wrapper">
      <h1>{error.message}</h1>
      <button className="btn-primary" onClick={() => reset()}>
        Try again
      </button>
    </main>
  )
}
