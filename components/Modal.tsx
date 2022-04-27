import { KeyboardEventHandler } from 'react'
import {
  ComponentPropsWithoutRef,
  Dispatch,
  KeyboardEvent,
  ReactNode,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'

type SetIsOpen = Dispatch<SetStateAction<boolean>>
type DivProps = Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'id'>
type Setup<T, U> = {
  firstFocusable: RefObject<T>
  lastFocusable?: RefObject<U>
  onShiftTab: KeyboardEventHandler
  onTab: KeyboardEventHandler
  setIsOpen: SetIsOpen
}

interface WithoutFirstFocusableFocused<T, U, V> {
  isFirstFocusableFocused?: false
  renderContent: (setup: { focused: RefObject<U> } & Setup<T, V>) => ReactNode
}

interface WithFirstFocusableFocused<T, U> {
  isFirstFocusableFocused: true
  renderContent: (setup: Setup<T, U>) => ReactNode
}

type ModalProps<T, U, V> = DivProps & {
  id: string
  openerId: string
  renderOpener: (setIsOpen: SetIsOpen, isOpen: boolean) => ReactNode
} & (WithoutFirstFocusableFocused<T, V, U> | WithFirstFocusableFocused<T, U>)

const Modal = <
  FirstFocusable extends HTMLElement,
  LastFocusable extends HTMLElement | null = null,
  Focused extends HTMLElement | null = null
>({
  id,
  openerId,
  renderOpener,
  renderContent,
  isFirstFocusableFocused,
  ...rest
}: ModalProps<FirstFocusable, LastFocusable, Focused>) => {
  const focused = useRef<Focused>(null)
  const firstFocusable = useRef<FirstFocusable>(null)
  const lastFocusable = useRef<LastFocusable>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement

      if (t.getAttribute('id') === openerId) return
      if (t.closest('#' + id)) return

      setIsOpen(false)
    }

    document.addEventListener('click', onClick)

    return () => document.removeEventListener('click', onClick)
  }, [id, openerId])

  useEffect(() => {
    if (!isOpen) return

    if (isFirstFocusableFocused) {
      return firstFocusable.current?.focus()
    }

    focused.current?.focus()
  }, [isOpen, isFirstFocusableFocused])

  const setup = {
    firstFocusable,
    lastFocusable,
    onShiftTab(e: KeyboardEvent<HTMLElement>) {
      if (e.shiftKey && e.key === 'Tab') {
        lastFocusable.current?.focus()
        e.preventDefault()
      }
    },
    onTab(e: KeyboardEvent<HTMLElement>) {
      if (e.key === 'Tab' && !e.shiftKey) {
        firstFocusable.current?.focus()
        e.preventDefault()
      }
    },
    setIsOpen,
  }

  return (
    <>
      {renderOpener(setIsOpen, isOpen)}
      {isOpen ? (
        <div
          {...rest}
          id={id}
          role="dialog"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false)
            e.stopPropagation()
          }}
        >
          {isFirstFocusableFocused
            ? renderContent(setup)
            : renderContent({ ...setup, focused })}
        </div>
      ) : null}
    </>
  )
}

export default Modal
