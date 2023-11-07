'use client'

import ArrowLeft from 'public/static/images/arrow-left.svg'

export default function PreviousPageButton() {
  return (
    <button
      className="round-btn"
      onClick={() => window.history.back()}
      aria-label="Go back to the previous page"
    >
      <ArrowLeft className="w-full h-full" />
    </button>
  )
}
