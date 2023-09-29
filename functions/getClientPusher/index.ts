import Pusher from 'pusher-js/with-encryption'
import { NEXT_PUBLIC_PUSHER_CLUSTER, NEXT_PUBLIC_PUSHER_KEY } from 'env/public'

const getClientPusher = () => {
  let pusher: Pusher | null = null

  return () => {
    if (!pusher) {
      pusher = new Pusher(NEXT_PUBLIC_PUSHER_KEY, {
        cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
        channelAuthorization: {
          endpoint: '/api/pusher/auth',
          transport: 'ajax',
        },
        forceTLS: true,
      })
    }

    return pusher
  }
}

export default getClientPusher()
