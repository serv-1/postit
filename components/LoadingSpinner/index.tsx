export default function LoadingSpinner() {
  return (
    <div
      role="status"
      className="animate-spin w-40 h-40 rounded-full border-6 border-fuchsia-200 border-t-fuchsia-600"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
