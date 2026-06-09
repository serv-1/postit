interface DiscussionBadgeProps {
  isShown?: boolean
}

export default function DiscussionBadge({ isShown }: DiscussionBadgeProps) {
  return (
    isShown && (
      <div
        role="status"
        aria-label="New message"
        className="absolute -top-2 -right-2 z-10"
      >
        <div className="w-12 h-12 rounded-full bg-red-600">
          <div className="h-full rounded-full bg-inherit animate-ping"></div>
        </div>
      </div>
    )
  )
}
