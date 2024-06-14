import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'role' | 'aria-modal'
> & {
  children: React.ReactNode
  onClose: () => void
  isHidden?: boolean
}

export default function Modal({
  children,
  onClose,
  isHidden,
  className,
  ...rest
}: ModalProps) {
  const focusableEls =
    "a[href]:not([tabindex='-1']), area[href]:not([tabindex='-1']), input:not([disabled]):not([tabindex='-1']), select:not([disabled]):not([tabindex='-1']), textarea:not([disabled]):not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']), iframe:not([tabindex='-1']), [tabindex]:not([tabindex='-1']), [contentEditable=true]:not([tabindex='-1'])"

  const [isContainerMounted, setIsContainerMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const idRef = useRef('a' + nanoid())
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    const restoreFocus = document.activeElement as HTMLElement
    const container = document.createElement('div')

    container.setAttribute('id', idRef.current)

    const onClick = (e: MouseEvent) => {
      if (modalRef.current?.contains(e.target as HTMLElement)) {
        return
      }

      onCloseRef.current()
    }

    container.addEventListener('click', onClick)
    document.body.appendChild(container)
    setIsContainerMounted(true)

    return () => {
      container.remove()
      container.removeEventListener('click', onClick)
      restoreFocus.focus()
    }
  }, [])

  useEffect(() => {
    if (!modalRef.current) return

    const el = modalRef.current.querySelectorAll<HTMLElement>(focusableEls)[0]

    if (el) el.focus()
  }, [isContainerMounted])

  useEffect(() => {
    if (document.body.classList.contains('overflow-hidden') || isHidden) {
      return
    }

    const noScrollbar = 'overflow-hidden'

    document.body.classList.add(noScrollbar)

    return () => {
      document.body.classList.remove(noScrollbar)
    }
  }, [isHidden])

  if (!isContainerMounted) return null

  return createPortal(
    <div
      {...rest}
      className={isHidden ? 'hidden' : className}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onCloseRef.current()
        } else if (e.key === 'Tab') {
          const modal = modalRef.current
          if (!modal) return

          const els = modal.querySelectorAll<HTMLElement>(focusableEls)
          const first = els[0]
          const last = els[els.length - 1]

          if (e.target === first && e.shiftKey) {
            last.focus()
            e.preventDefault()
          } else if (e.target === last && !e.shiftKey) {
            first.focus()
            e.preventDefault()
          }
        }

        e.stopPropagation()
      }}
    >
      {children}
    </div>,
    document.querySelector('#' + idRef.current)!
  )
}
