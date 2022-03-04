const Spinner = () => (
  <div
    className="w-full h-full rounded-full border-indigo-600 border-l-4 border-r-4 border-t-4 border-t-white border-b-4 border-b-white animate-spin"
    role="status"
  >
    <span className="sr-only">Loading...</span>
  </div>
)

export default Spinner
