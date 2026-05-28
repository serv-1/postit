import XSvg from 'components/XSvg'
import ScreenFullSvg from 'components/ScreenFullSvg'

interface MapFullScreenButtonProps {
  fullScreen: boolean
  setFullScreen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MapFullScreenButton({
  fullScreen,
  setFullScreen,
}: MapFullScreenButtonProps) {
  return fullScreen ? (
    <button
      className="btn-round absolute top-8 right-8 z-501"
      type="button"
      onClick={() => setFullScreen(false)}
      aria-label="Minimize"
    >
      <XSvg className="w-full h-full" />
    </button>
  ) : (
    <button
      className="btn-round-sm absolute top-8 right-8 z-501"
      type="button"
      onClick={() => setFullScreen(true)}
      aria-label="Full screen"
    >
      <ScreenFullSvg className="w-full h-full" />
    </button>
  )
}
