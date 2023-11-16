import type { UpdateProfileUserNameEvent } from './customEvent'

declare global {
  interface DocumentEventMap {
    updateProfileUserName: UpdateProfileUserNameEvent
  }
}
