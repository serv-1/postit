import DiscussionSendBar from 'components/DiscussionSendBar'
import Modal from 'components/Modal'
import X from 'public/static/images/x.svg'
import DiscussionMessageList from 'components/DiscussionMessageList'
import type { DiscussionsIdGetData } from 'app/api/discussions/[id]/types'
import type { User } from 'types'

type DiscussionModalProps =
  | (
      | {
          discussionId: string
          messages: DiscussionsIdGetData['messages']
          signedInUser: User
          interlocutor: User | null
          postName?: never
          postId?: never
          sellerId?: never
        }
      | {
          discussionId?: never
          messages?: never
          signedInUser?: never
          interlocutor?: never
          postName: string
          postId: string
          sellerId: string
        }
    ) & { onMessageSent?: (id: string) => void; onClose: () => void }

export default function DiscussionModal({
  onMessageSent,
  onClose,
  postName,
  postId,
  sellerId,
  discussionId,
  messages,
  signedInUser,
  interlocutor,
}: DiscussionModalProps) {
  return (
    <Modal
      className="fixed top-0 left-0 w-screen h-screen z-[1001] md:flex md:justify-center md:items-center md:bg-fuchsia-900/25"
      onClose={onClose}
    >
      <div className="bg-fuchsia-50 z-[1001] flex flex-col h-full md:w-full md:max-w-[450px] md:max-h-[800px] md:rounded-16 md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
        <button
          className="w-32 h-32 m-8 md:m-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="w-full h-full" />
        </button>
        {discussionId ? (
          <>
            <DiscussionMessageList
              signedInUser={signedInUser}
              interlocutor={interlocutor}
              messages={messages}
            />
            <DiscussionSendBar
              onMessageSent={onMessageSent}
              discussionId={discussionId}
            />
          </>
        ) : (
          <DiscussionSendBar
            onMessageSent={onMessageSent}
            sellerId={sellerId}
            postName={postName}
            postId={postId}
          />
        )}
      </div>
    </Modal>
  )
}
