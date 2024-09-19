import X from 'public/static/images/x.svg'
import ScreenFull from 'public/static/images/screen-full.svg'

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
      className="round-btn absolute top-8 right-8 z-[501]"
      type="button"
      onClick={() => setFullScreen(false)}
      aria-label="Minimize"
    >
      <X className="w-full h-full" />
    </button>
  ) : (
    <button
      className="sm-round-btn absolute top-8 right-8 z-[501]"
      type="button"
      onClick={() => setFullScreen(true)}
      aria-label="Full screen"
    >
      <ScreenFull className="w-full h-full" />
    </button>
  )
}
