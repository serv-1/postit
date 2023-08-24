import Pusher from 'pusher-js/with-encryption'

const getClientPusher = () => {
  let pusher: Pusher | null = null

  return () => {
    if (!pusher) {
      pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
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
