'use client'

import {
  arrow,
  FloatingArrow,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  type Placement,
} from '@floating-ui/react'
import { useId, useRef, useState } from 'react'

interface TooltipProps {
  placement?: Placement
  renderReference: (props: Record<string, unknown>) => React.ReactNode
  children: React.ReactNode
}

export default function Tooltip({
  placement,
  renderReference,
  children,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const arrowRef = useRef(null)

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6), shift(), arrow({ element: arrowRef })],
  })

  const hover = useHover(context)
  const focus = useFocus(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
  ])

  const tooltipId = useId()

  return (
    <>
      {renderReference({
        ...getReferenceProps(),
        ref: refs.setReference,
        'aria-describedby': tooltipId,
      })}
      {isOpen && (
        <div
          {...getFloatingProps()}
          ref={refs.setFloating}
          id={tooltipId}
          role="tooltip"
          style={floatingStyles}
          className="bg-fuchsia-900 text-fuchsia-50 rounded py-4 px-8 break-words"
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            width={12}
            height={6}
            className="fill-fuchsia-900"
            style={{
              position: 'absolute',
              left: middlewareData.arrow?.x,
              top: middlewareData.arrow?.y,
            }}
          />
          {children}
        </div>
      )}
    </>
  )
}
