import { NextResponse } from 'next/server'
import getServerPusher from 'utils/functions/getServerPusher'

export async function POST(request: Request) {
  const { socket_id, channel_name } = await request.json()
  const pusher = getServerPusher()

  return NextResponse.json(pusher.authorizeChannel(socket_id, channel_name), {
    status: 200,
  })
}
