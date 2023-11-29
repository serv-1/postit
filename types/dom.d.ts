import type { SearchPostEvent, UpdateProfileUserNameEvent } from './customEvent'

declare global {
  interface DocumentEventMap {
    updateProfileUserName: UpdateProfileUserNameEvent
    searchPost: SearchPostEvent
  }
}
