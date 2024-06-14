import pusher from 'libs/pusher/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const data = new URLSearchParams(await request.text())

  return NextResponse.json(
    pusher.authorizeChannel(data.get('socket_id')!, data.get('channel_name')!),
    { status: 200 }
  )
}
