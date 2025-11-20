import { useState } from 'react'
import ChevronUp from 'public/static/images/chevron-up.svg'
import ChevronDown from 'public/static/images/chevron-down.svg'
import classNames from 'classnames'

interface AccordionProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'tabIndex'> {
  title: string
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  id: string
}

export default function Accordion({
  title,
  headingLevel,
  children,
  id,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const Heading = ('h' + headingLevel) as keyof React.JSX.IntrinsicElements

  return (
    <div className="mb-16 bg-fuchsia-200 rounded-8 md:bg-fuchsia-300">
      <Heading id={id + '-accordionHeader'}>
        <button
          className={classNames(
            'w-full flex flex-row flex-nowrap justify-between items-center bg-fuchsia-200 p-8 rounded-8 md:bg-fuchsia-300',
            { 'shadow-[0_4px_4px_rgba(112,26,117,0.1)]': isOpen }
          )}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={id + '-accordionPanel'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen)
              e.preventDefault()
            }
          }}
        >
          <span className="text-base">{title}</span>
          {isOpen ? (
            <ChevronUp
              className="w-24 h-24 text-fuchsia-600"
              data-testid="chevronUp"
            />
          ) : (
            <ChevronDown
              className="w-24 h-24 text-fuchsia-600"
              data-testid="chevronDown"
            />
          )}
        </button>
      </Heading>
      {isOpen && (
        <div
          role="region"
          aria-labelledby={id + '-accordionHeader'}
          id={id + '-accordionPanel'}
          className="rounded-b-8 p-16"
        >
          {children}
        </div>
      )}
    </div>
  )
}
