import Pusher from 'pusher'
import env from 'utils/constants/env'

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
