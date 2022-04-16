const Spinner = () => (
  <div
    className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full border-8 border-fuchsia-200 border-r-fuchsia-400 animate-spin"
    role="status"
  >
    <span className="sr-only">Loading...</span>
  </div>
)

export default Spinner
