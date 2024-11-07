import type Pusher from 'pusher-js/with-encryption'
import { useEffect, useState } from 'react'

export default function usePusher<T>(
  channelName: string,
  eventName: string,
  eventHandler: (data: T) => void
) {
  const [pusher, setPusher] = useState<Pusher>()

  useEffect(() => {
    if (pusher) return

    async function initPusher() {
      setPusher((await import('libs/pusher/client')).default)
    }

    initPusher()
  }, [pusher])

  useEffect(() => {
    if (!pusher) return

    const channel = pusher.subscribe(channelName)

    channel.bind(eventName, eventHandler)

    return () => {
      channel.unbind(eventName, eventHandler)
    }
  }, [pusher, channelName, eventHandler, eventName])
}
