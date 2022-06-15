import { Options as OffsetOptions } from '@popperjs/core/lib/modifiers/offset'
import { Options as ArrowOptions } from '@popperjs/core/lib/modifiers/arrow'
import { PreventOverflowModifier } from '@popperjs/core/lib/modifiers/preventOverflow'
import { ComputeStylesModifier } from '@popperjs/core/lib/modifiers/computeStyles'
import { FlipModifier } from '@popperjs/core/lib/modifiers/flip'
import { useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import { EventListenersModifier } from '@popperjs/core/lib/modifiers/eventListeners'
import { Placement, PositioningStrategy, State } from '@popperjs/core'

type Reference = HTMLButtonElement | null
type Arrow = HTMLDivElement | null
type Popper = HTMLDivElement | null

export interface PopupProps {
  referenceContent: React.ReactNode
  popupContent: React.ReactNode
  referenceClassName?: string
  popupClassName?: string
  arrowClassName?: string
  containerClassName?: string
  openOnHover?: boolean
  placement?: Placement
  strategy?: PositioningStrategy
  onFirstUpdate?: (x: Partial<State>) => void
  arrowPadding?: ArrowOptions['padding']
  offset?: OffsetOptions['offset']
  preventOverflowOptions?: PreventOverflowModifier['options']
  flipOptions?: FlipModifier['options']
  computeStylesOptions?: ComputeStylesModifier['options']
  eventListenersOptions?: EventListenersModifier['options']
}

const Popup = ({
  referenceContent,
  referenceClassName,
  popupContent,
  popupClassName,
  arrowClassName,
  containerClassName,
  openOnHover,
  placement,
  strategy,
  onFirstUpdate,
  arrowPadding,
  offset,
  preventOverflowOptions,
  flipOptions,
  computeStylesOptions,
  eventListenersOptions,
}: PopupProps) => {
  const [popperEl, setPopperEl] = useState<Popper>(null)
  const [arrowEl, setArrowEl] = useState<Arrow>(null)
  const [referenceEl, setReferenceEl] = useState<Reference>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isHover, setIsHover] = useState(false)

  const { styles, attributes } = usePopper(referenceEl, popperEl, {
    placement,
    strategy,
    onFirstUpdate,
    modifiers: [
      { name: 'offset', options: { offset } },
      { name: 'arrow', options: { element: arrowEl, padding: arrowPadding } },
      { name: 'preventOverflow', options: preventOverflowOptions },
      { name: 'flip', options: flipOptions },
      { name: 'computeStyles', options: computeStylesOptions },
      { name: 'eventListeners', options: eventListenersOptions },
    ],
  })

  useEffect(() => {
    if (!referenceEl || !popperEl) return

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (popperEl.contains(t) || referenceEl.contains(t)) return
      setIsOpen(false)
      setIsHover(false)
    }

    document.addEventListener('click', onClick)

    return () => document.removeEventListener('click', onClick)
  }, [setIsOpen, popperEl, referenceEl])

  return (
    <div
      className={containerClassName}
      onMouseEnter={() => {
        if (window.innerWidth < 1024) return
        if (openOnHover && !isOpen) setIsHover(true)
      }}
      onMouseLeave={() => {
        if (window.innerWidth < 1024) return
        if (openOnHover && !isOpen) setIsHover(false)
      }}
    >
      <button
        type="button"
        className={referenceClassName}
        ref={setReferenceEl}
        onClick={() => setIsOpen(!isOpen)}
      >
        {referenceContent}
      </button>
      {(isOpen || isHover) && (
        <div
          id="popup"
          className={popupClassName}
          ref={setPopperEl}
          style={styles.popper}
          {...attributes.popper}
        >
          {popupContent}
          <div
            id="popup-arrow"
            ref={setArrowEl}
            className={arrowClassName}
            style={styles.arrow}
            {...attributes.arrow}
          ></div>
        </div>
      )}
    </div>
  )
}

export default Popup
