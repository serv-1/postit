import { NextApiRequest, NextApiResponse } from 'next'
import pusher from '../../../utils/functions/initPusher'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const socketId = req.body.socket_id
  const channelName = req.body.channel_name
  // @ts-ignore
  res.status(200).json(pusher.authorizeChannel(socketId, channelName))
}

export default handler
