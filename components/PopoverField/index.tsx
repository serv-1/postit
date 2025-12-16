import {
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import classNames from 'classnames'
import { useId, useState } from 'react'

interface PopoverFieldProps {
  label: string
  children: React.ReactNode
}

export default function PopoverField({ label, children }: PopoverFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4), shift()],
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ])

  const popoverId = useId()
  const referenceId = useId()

  return (
    <>
      <button
        {...getReferenceProps()}
        ref={refs.setReference}
        id={referenceId}
        type="button"
        aria-controls={popoverId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={classNames(
          'hover:bg-fuchsia-600 hover:text-fuchsia-50 border-2 border-fuchsia-600 px-8 py-4 rounded-full transition-colors duration-200 font-bold',
          isOpen ? 'bg-fuchsia-600 text-fuchsia-50' : 'text-fuchsia-600'
        )}
      >
        {label}
      </button>
      {isOpen && (
        <div
          {...getFloatingProps()}
          ref={refs.setFloating}
          id={popoverId}
          role="dialog"
          aria-labelledby={referenceId}
          style={floatingStyles}
          className="bg-fuchsia-200 border-2 border-fuchsia-500 shadow-[0_0_16px_#D946EF] rounded-8 z-20 p-16 w-full max-w-[328px] lg:max-w-none"
        >
          {children}
        </div>
      )}
    </>
  )
}
