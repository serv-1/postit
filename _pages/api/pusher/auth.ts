import { NextApiRequest, NextApiResponse } from 'next'
import getServerPusher from '../../../utils/functions/getServerPusher'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const socketId = req.body.socket_id
  const channelName = req.body.channel_name
  const pusher = getServerPusher()
  // @ts-ignore
  res.status(200).json(pusher.authorizeChannel(socketId, channelName))
}

export default handler
