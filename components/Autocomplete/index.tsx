import classNames from 'classnames'
import useEventListener from 'hooks/useEventListener'
import { useState, useRef, useCallback } from 'react'

type InputProps = Required<
  Pick<
    React.ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'onKeyDown'
    | 'onFocus'
    | 'role'
    | 'aria-autocomplete'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-activedescendant'
    | 'className'
  >
>

type OptionProps = Required<
  Pick<
    React.ComponentPropsWithoutRef<'li'>,
    'id' | 'onClick' | 'role' | 'aria-selected' | 'className'
  >
>

interface Option {
  id: string
}

interface AutocompleteProps<O extends Option> {
  className?: string
  options: O[]
  renderInput: (props: InputProps) => React.ReactNode
  renderOption: (props: OptionProps, option: O) => React.ReactNode
  error?: string
}

export default function Autocomplete<O extends Option>({
  className,
  options,
  renderInput,
  renderOption,
  error,
}: AutocompleteProps<O>) {
  const [showOptions, setShowOptions] = useState(false)
  const [activeOptionPosition, setActiveOptionPosition] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const optionListRef = useRef<HTMLUListElement>(null)

  function handleFocus() {
    setShowOptions(true)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const optsLen = options.length

      if (!optsLen) return

      const pos = activeOptionPosition

      switch (e.key) {
        case 'ArrowDown':
          const prevPos = (pos + 1) % optsLen
          const prevOpt = document.getElementById(options[prevPos].id)!

          setActiveOptionPosition(prevPos)
          prevOpt.scrollIntoView({ block: 'nearest' })

          break
        case 'ArrowUp':
          const nextPos = (((pos - 1) % optsLen) + optsLen) % optsLen
          const nextOpt = document.getElementById(options[nextPos].id)!

          setActiveOptionPosition(nextPos)
          nextOpt.scrollIntoView({ block: 'nearest' })

          break
        case 'Tab':
        case 'Enter':
          const opt = document.getElementById(options[pos].id)!

          opt.click()

          break
      }
    },
    [options, activeOptionPosition]
  )

  useEventListener('document', 'click', (e) => {
    if (!containerRef.current?.contains(e.target as Node)) {
      setShowOptions(false)
    }
  })

  useEventListener(containerRef, 'wheel', (e) => {
    e.stopPropagation()
  })

  useEventListener(containerRef, 'touchmove', (e) => {
    e.stopPropagation()
  })

  return (
    <div ref={containerRef} className={className}>
      {renderInput({
        type: 'search',
        onKeyDown: handleKeyDown,
        onFocus: handleFocus,
        role: 'combobox',
        'aria-autocomplete': 'list',
        'aria-expanded': showOptions,
        'aria-controls': 'optionList',
        'aria-activedescendant': options[activeOptionPosition]?.id || '',
        className:
          'p-8 border-b-2 transition-colors duration-200 rounded outline-none bg-fuchsia-50 placeholder:text-fuchsia-900/50 w-full border-fuchsia-900/25 focus-within:border-fuchsia-900/75 text-base',
      })}
      {error && (
        <div
          role="alert"
          className="text-rose-600 text-base font-bold bg-rose-50/75 rounded p-4 my-2"
        >
          {error}
        </div>
      )}
      {showOptions && (
        <ul
          ref={optionListRef}
          id="optionList"
          role="listbox"
          aria-label="Options"
          className="my-4 shadow-[0_4px_4px_rgba(112,26,117,0.35)] rounded max-h-[192px] overflow-auto"
        >
          {options.map((option, i) =>
            renderOption(
              {
                id: option.id,
                onClick: () => {
                  setShowOptions(false)
                  setActiveOptionPosition(i)
                },
                role: 'option',
                'aria-selected': activeOptionPosition === i,
                className: classNames(
                  'py-4 px-4 cursor-pointer',
                  activeOptionPosition === i
                    ? 'bg-fuchsia-200'
                    : 'bg-fuchsia-100'
                ),
              },
              option
            )
          )}
        </ul>
      )}
    </div>
  )
}
