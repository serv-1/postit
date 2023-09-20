import { NextResponse } from 'next/server'
import getServerPusher from 'utils/functions/getServerPusher'

export async function POST(request: Request) {
  const data = new URLSearchParams(await request.text())
  const pusher = getServerPusher()

  return NextResponse.json(
    pusher.authorizeChannel(
      data.get('socket_id') as string,
      data.get('channel_name') as string
    ),
    { status: 200 }
  )
}
