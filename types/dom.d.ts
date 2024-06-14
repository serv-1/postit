import type {
  SearchPostEvent,
  UpdateProfileUserNameEvent,
  OpenDiscussionEvent,
  DiscussionDeletedEvent,
  NewDiscussionEvent,
} from './customEvent'

declare global {
  interface DocumentEventMap {
    updateProfileUserName: UpdateProfileUserNameEvent
    searchPost: SearchPostEvent
    openDiscussion: OpenDiscussionEvent
    discussionDeleted: DiscussionDeletedEvent
    newDiscussion: NewDiscussionEvent
  }
}
