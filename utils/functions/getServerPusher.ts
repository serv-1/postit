import Pusher from 'pusher'
import env from '../constants/env'

/**
 * Return a new instance of Pusher (for the server) or the one that already exist.
 */
const getServerPusher = () => {
  let pusher: Pusher | null = null

  return () => {
    if (!pusher) {
      pusher = new Pusher({
        encryptionMasterKeyBase64: env.PUSHER_ENCRYPTION_KEY,
        cluster: env.PUSHER_CLUSTER,
        secret: env.PUSHER_SECRET,
        appId: env.PUSHER_APP_ID,
        key: env.PUSHER_KEY,
        useTLS: true,
      })
    }

    return pusher
  }
}

export default getServerPusher()
