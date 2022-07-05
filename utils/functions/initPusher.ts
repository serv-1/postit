import Pusher from 'pusher'
import env from '../constants/env'

/**
 * Return a new instance of Pusher or the one that already exist.
 */
const initPusher = () => {
  let pusher: Pusher | null = null

  return () => {
    if (!pusher) {
      pusher = new Pusher({
        appId: '1425056',
        key: 'b00613560b578f204a9a',
        secret: 'e9755bd61fb92190a800',
        cluster: 'eu',
        useTLS: true,
        encryptionMasterKeyBase64: env.PUSHER_ENCRYPTION_KEY,
      })
    }

    return pusher
  }
}

export default initPusher()()
