import Pusher from 'pusher-js/with-encryption'

/**
 * Return a new instance of Pusher (for the client) or the one that already exist.
 */
const getClientPusher = () => {
  let pusher: Pusher | null = null

  return () => {
    if (!pusher) {
      pusher = new Pusher('b00613560b578f204a9a', {
        cluster: 'eu',
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
