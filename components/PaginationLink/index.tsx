import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationLinkProps {
  page: number
  ariaLabel: string
  children: React.ReactNode
}

export default function PaginationLink({
  page,
  ariaLabel,
  children,
}: PaginationLinkProps) {
  const searchParams = useSearchParams()
  const newSearchParams = new URLSearchParams(searchParams.toString())

  newSearchParams.set('page', page.toString())

  return (
    <Link
      href={'?' + newSearchParams.toString()}
      className="flex justify-center items-center rounded-sm w-28 h-28 md:w-32 md:h-32 bg-fuchsia-100 hover:bg-fuchsia-300 transition-colors duration-200"
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
