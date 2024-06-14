import pusher from 'libs/pusher/client'
import { useEffect } from 'react'

export default function usePusher<T>(
  channelName: string,
  eventName: string,
  eventHandler: (data: T) => void
) {
  useEffect(() => {
    const channel = pusher.subscribe(channelName)

    channel.bind(eventName, eventHandler)

    return () => {
      channel.unbind(eventName, eventHandler)
    }
  }, [channelName, eventHandler, eventName])
}
