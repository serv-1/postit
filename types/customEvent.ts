export type UpdateProfileUserNameEvent = CustomEvent<{
  name: string
}>

export type SearchPostEvent = CustomEvent<undefined>

export type OpenDiscussionEventData = string
export type OpenDiscussionEvent = CustomEvent<OpenDiscussionEventData>

export type DiscussionDeletedEventData = string
export type DiscussionDeletedEvent = CustomEvent<DiscussionDeletedEventData>

export type NewDiscussionEventData = string
export type NewDiscussionEvent = CustomEvent<NewDiscussionEventData>

export type ShowToastEventData = { message: string; error?: boolean }
export type ShowToastEvent = CustomEvent<ShowToastEventData>
