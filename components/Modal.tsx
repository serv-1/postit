import { nanoid } from 'nanoid'
import {
  ComponentPropsWithoutRef,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type ModalProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'role' | 'aria-modal'
> & {
  children: ReactNode
  setIsOpen: Dispatch<SetStateAction<boolean>>
  isHidden?: boolean
}

const Modal = ({ children, setIsOpen, isHidden, ...rest }: ModalProps) => {
  const focusableEls =
    "a[href]:not([tabindex='-1']), area[href]:not([tabindex='-1']), input:not([disabled]):not([tabindex='-1']), select:not([disabled]):not([tabindex='-1']), textarea:not([disabled]):not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']), iframe:not([tabindex='-1']), [tabindex]:not([tabindex='-1']), [contentEditable=true]:not([tabindex='-1'])"

  const [isContainerMounted, setIsContainerMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const idRef = useRef('a' + nanoid())

  useEffect(() => {
    const restoreFocus = document.activeElement as HTMLElement
    const container = document.createElement('div')
    container.setAttribute('id', idRef.current)

    const onClick = (e: MouseEvent) => {
      if (modalRef.current?.contains(e.target as HTMLElement)) return
      setIsOpen(false)
    }

    container.addEventListener('click', onClick)
    document.body.appendChild(container)
    setIsContainerMounted(true)

    return () => {
      container.remove()
      container.removeEventListener('click', onClick)
      restoreFocus.focus()
    }
  }, [setIsOpen])

  useEffect(() => {
    if (!modalRef.current) return
    const el = modalRef.current.querySelectorAll<HTMLElement>(focusableEls)[0]
    if (el) el.focus()
  }, [isContainerMounted])

  useEffect(() => {
    const _class = ' overflow-hidden'

    if (document.body.className.includes(_class)) return

    if (isHidden) {
      document.body.className = document.body.className.replace(_class, '')
    } else if (isHidden === false) {
      document.body.className += _class
    } else {
      document.body.className += _class
    }

    return () => {
      document.body.className = document.body.className.replace(_class, '')
    }
  }, [isHidden])

  if (!isContainerMounted) return null

  return createPortal(
    <div
      {...rest}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
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
    document.querySelector('#' + idRef.current) as HTMLElement
  )
}

export default Modal
