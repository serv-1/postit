'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex justify-center items-center flex-col bg-linear-wrapper md:h-[480px] rounded-16 gap-y-16 h-[240px] max-w-[450px] mx-auto md:max-w-none">
      <h1>{error.message}</h1>
      <button className="primary-btn" onClick={() => reset()}>
        Try again
      </button>
    </main>
  )
}
