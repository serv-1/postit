import CommentDiscussion from 'public/static/images/comment-discussion.svg'
import X from 'public/static/images/x.svg'
import Modal from 'components/Modal'
import Discussion from 'components/Discussion'
import LoadingSpinner from 'components/LoadingSpinner'
import type { Discussion as IDiscussion } from 'types'

export interface DiscussionListModalProps {
  discussions?: IDiscussion[]
  isHidden: boolean
  onClose: () => void
  openedDiscussionId: string | null
  setOpenedDiscussionId: React.Dispatch<React.SetStateAction<string | null>>
}

export default function DiscussionListModal({
  discussions,
  isHidden,
  onClose,
  openedDiscussionId,
  setOpenedDiscussionId,
}: DiscussionListModalProps) {
  return (
    <Modal
      isHidden={isHidden}
      onClose={onClose}
      className={
        'fixed top-0 left-0 w-screen h-screen z-[1001] md:flex md:justify-center md:items-center md:bg-fuchsia-900/25'
      }
    >
      <div className="bg-fuchsia-50 z-[1001] flex flex-col h-full md:w-full md:max-w-[450px] md:max-h-[800px] md:rounded-16 md:shadow-[0_0_32px_rgba(112,26,117,0.25)]">
        <button
          className="w-32 h-32 mt-16 mx-16 text-fuchsia-600 self-end hover:text-fuchsia-900 transition-colors duration-200"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="w-full h-full" />
        </button>
        {discussions ? (
          discussions.length > 0 ? (
            <ul className="overflow-y-auto px-[12px] py-16 mx-[4px] chatScrollbar">
              {discussions.map((discussion) => (
                <li className="mb-8 last:mb-0" key={discussion.id}>
                  <Discussion
                    discussion={discussion}
                    isModalOpen={discussion.id === openedDiscussionId}
                    setOpenedDiscussionId={setOpenedDiscussionId}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="w-full h-full relative p-16 flex flex-row justify-center items-center">
              <div className="w-full h-full max-w-[328px] max-h-[328px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-fuchsia-100">
                <CommentDiscussion className="w-full h-full" />
              </div>
              <p className="z-10">Your discussions will be displayed here.</p>
            </div>
          )
        ) : (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </Modal>
  )
}
