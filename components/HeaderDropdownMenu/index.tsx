import Image from 'next/image'
import Link from 'next/link'
import Popup from 'components/Popup'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import SignOutButton from 'components/SignOutButton'

interface HeaderDropdownMenuProps {
  userImage?: string
}

export default function HeaderDropdownMenu({
  userImage,
}: HeaderDropdownMenuProps) {
  return (
    <Popup
      openOnHover
      placement="bottom-end"
      containerClassName="w-40 h-40"
      arrowClassName="w-8 absolute top-4 before:absolute before:visible before:w-8 before:h-8 before:bg-fuchsia-50 before:rotate-45 -z-10"
      referenceClassName="w-full h-full relative cursor-pointer"
      referenceContent={
        <Image
          src={
            userImage
              ? NEXT_PUBLIC_AWS_URL + '/' + userImage
              : NEXT_PUBLIC_DEFAULT_USER_IMAGE
          }
          alt="Your profile image"
          fill
          className="rounded-full object-cover"
        />
      }
      popupClassName="z-10 pt-8"
      popupContent={
        <ul
          id="mainHeaderMenu"
          className="p-16 bg-fuchsia-50 rounded-8 font-bold shadow-[-8px_8px_8px_rgba(112,26,117,0.05)]"
        >
          <li>
            <Link
              href="/profile"
              className="pb-8 inline-block w-full hover:underline"
            >
              Profile
            </Link>
          </li>
          <li>
            <SignOutButton className="hover:underline">Sign out</SignOutButton>
          </li>
        </ul>
      }
    />
  )
}
