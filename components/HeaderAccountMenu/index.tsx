import Link from 'next/link'
import {
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import SignOutButton from 'components/SignOutButton'
import { useId, useState } from 'react'
import Image from 'next/image'

interface HeaderAccountMenuProps {
  userImage?: string
}

export default function HeaderAccountMenu({
  userImage,
}: HeaderAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-end',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8)],
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ])

  const referenceId = useId()
  const menuId = useId()

  return (
    <>
      <button
        {...getReferenceProps()}
        ref={refs.setReference}
        id={referenceId}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="align-top"
      >
        <Image
          src={
            userImage
              ? NEXT_PUBLIC_AWS_URL + '/' + userImage
              : NEXT_PUBLIC_DEFAULT_USER_IMAGE
          }
          alt=""
          width={40}
          height={40}
          className="rounded-full"
        />
      </button>
      {isOpen && (
        <ul
          {...getFloatingProps()}
          ref={refs.setFloating}
          id={menuId}
          style={floatingStyles}
          className="p-16 bg-fuchsia-50 rounded-8 font-bold shadow-[-8px_8px_8px_rgba(112,26,117,0.05)] z-10"
          role="menu"
          aria-labelledby={referenceId}
        >
          <li role="presentation">
            <Link
              role="menuitem"
              href="/profile"
              className="pb-8 inline-block w-full hover:underline"
            >
              Profile
            </Link>
          </li>
          <li role="presentation">
            <SignOutButton role="menuitem" className="hover:underline">
              Sign out
            </SignOutButton>
          </li>
        </ul>
      )}
    </>
  )
}
