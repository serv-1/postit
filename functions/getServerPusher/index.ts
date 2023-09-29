import Pusher from 'pusher'
import { PUSHER_APP_ID, PUSHER_SECRET, PUSHER_ENCRYPTION_KEY } from 'env'
import { NEXT_PUBLIC_PUSHER_CLUSTER, NEXT_PUBLIC_PUSHER_KEY } from 'env/public'

const getServerPusher = () => {
  let pusher: Pusher | null = null

  return () => {
    if (!pusher) {
      pusher = new Pusher({
        encryptionMasterKeyBase64: PUSHER_ENCRYPTION_KEY,
        cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
        secret: PUSHER_SECRET,
        appId: PUSHER_APP_ID,
        key: NEXT_PUBLIC_PUSHER_KEY,
        useTLS: true,
      })
    }

    return pusher
  }
}

export default getServerPusher()
