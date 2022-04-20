const Pulser = () => {
  return (
    <div
      className="w-full h-full rounded-full bg-fuchsia-300 animate-pulse"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Pulser
