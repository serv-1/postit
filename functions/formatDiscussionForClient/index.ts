import type { DiscussionDoc } from 'models/Discussion'
import type { UserDoc } from 'models/User'

export default function formatDiscussionForClient(
  discussion: DiscussionDoc,
  buyer: UserDoc | null,
  seller: UserDoc | null,
  hasNewMessage: boolean
) {
  return {
    id: discussion._id,
    postId: discussion.postId,
    postName: discussion.postName,
    channelName: discussion.channelName,
    messages: discussion.messages,
    buyer: {
      id: buyer?._id,
      name: buyer ? buyer.name : '[DELETED]',
      image: buyer?.image,
    },
    seller: {
      id: seller?._id,
      name: seller ? seller.name : '[DELETED]',
      image: seller?.image,
    },
    hasNewMessage,
  }
}
