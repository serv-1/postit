import { NEXT_PUBLIC_PUSHER_CLUSTER, NEXT_PUBLIC_PUSHER_KEY } from 'env/public'
import Pusher from 'pusher-js/with-encryption'

const pusher = new Pusher(NEXT_PUBLIC_PUSHER_KEY, {
  cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
  channelAuthorization: {
    endpoint: '/api/pusher/auth',
    transport: 'ajax',
  },
  forceTLS: true,
})

export default pusher
