interface PaginationActivePageNumberProps {
  page: number
}

export default function PaginationActivePageNumber({
  page,
}: PaginationActivePageNumberProps) {
  return (
    <span
      className="flex justify-center items-center rounded w-[28px] h-[28px] md:w-32 md:h-32 bg-fuchsia-300"
      aria-label={'Page ' + page}
    >
      {page}
    </span>
  )
}
