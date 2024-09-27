import type {
  SearchPostEvent,
  UpdateProfileUserNameEvent,
  OpenDiscussionEvent,
  DiscussionDeletedEvent,
  NewDiscussionEvent,
  ShowToastEvent,
} from './customEvent'

declare global {
  interface DocumentEventMap {
    updateProfileUserName: UpdateProfileUserNameEvent
    searchPost: SearchPostEvent
    openDiscussion: OpenDiscussionEvent
    discussionDeleted: DiscussionDeletedEvent
    newDiscussion: NewDiscussionEvent
    showToast: ShowToastEvent
  }
}
