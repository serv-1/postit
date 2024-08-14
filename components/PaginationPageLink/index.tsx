import PaginationLink from 'components/PaginationLink'

interface PaginationPageLinkProps {
  page: number
}

export default function PaginationPageLink({ page }: PaginationPageLinkProps) {
  return (
    <PaginationLink page={page} ariaLabel={'Go to page ' + page}>
      {page}
    </PaginationLink>
  )
}
