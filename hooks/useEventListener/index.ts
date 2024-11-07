import { useEffect } from 'react'

export default function useEventListener<T extends keyof DocumentEventMap>(
  target: 'document',
  type: T,
  listener: (this: Document, ev: DocumentEventMap[T]) => void,
  options?: boolean | AddEventListenerOptions
): void
export default function useEventListener<T extends keyof WindowEventMap>(
  target: 'window',
  type: T,
  listener: (this: Window, ev: WindowEventMap[T]) => void,
  options?: boolean | AddEventListenerOptions
): void
export default function useEventListener<T extends keyof HTMLElementEventMap>(
  target: React.RefObject<HTMLElement>,
  type: T,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[T]) => void,
  options?: boolean | AddEventListenerOptions
): void
export default function useEventListener<
  TD extends keyof DocumentEventMap,
  TW extends keyof WindowEventMap,
  TH extends keyof HTMLElementEventMap
>(
  target: 'document' | 'window' | React.RefObject<HTMLElement>,
  type: TD | TW | TH,
  listener: (
    this: Document | Window | HTMLElement,
    ev:
      | DocumentEventMap[TD]
      | WindowEventMap[TW]
      | HTMLElementEventMap[TH]
      | Event
  ) => void,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    let eventTarget: Document | Window | HTMLElement | undefined = undefined

    if (target === 'document') {
      eventTarget = document
    } else if (target === 'window') {
      eventTarget = window
    } else if (target.current) {
      eventTarget = target.current
    } else {
      return
    }

    eventTarget.addEventListener(type, listener, options)

    return () => {
      eventTarget!.removeEventListener(type, listener, options)
    }
  }, [target, type, listener, options])
}
