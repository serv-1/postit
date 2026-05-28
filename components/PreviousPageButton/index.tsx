'use client'

import ArrowLeftSvg from 'components/ArrowLeftSvg'

export default function PreviousPageButton() {
  return (
    <button
      className="btn-round"
      onClick={() => window.history.back()}
      aria-label="Go back to the previous page"
    >
      <ArrowLeftSvg className="w-full h-full" />
    </button>
  )
}
