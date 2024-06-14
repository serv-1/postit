'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="grow bg-fuchsia-50 rounded-16 mb-8 flex flex-col justify-center items-center gap-y-16 shadow-wrapper">
      <h1>{error.message}</h1>
      <button className="primary-btn" onClick={() => reset()}>
        Try again
      </button>
    </main>
  )
}
