import Image from 'next/image'
import Modal from './Modal'
import X from '../public/static/images/x.svg'
import MainButton from './MainButton'

interface PostsSeeAllPhotosModalProps {
  images: string[]
}

const PostsSeeAllPhotosModal = ({ images }: PostsSeeAllPhotosModalProps) => {
  return (
    <Modal<HTMLButtonElement, HTMLButtonElement, HTMLButtonElement>
      id="seeAllPhotosModal"
      openerId="seeAllPhotosModalOpener"
      renderOpener={(setIsOpen) => (
        <MainButton
          id="seeAllPhotosModalOpener"
          bgColor={{ base: 'bg-fuchsia-50', states: 'hover:bg-fuchsia-900' }}
          textColor={{
            base: 'text-fuchsia-600',
            states: 'hover:text-fuchsia-50',
          }}
          radius="rounded-full"
          padding="p-8"
          className="shadow-[0_2px_8px_rgba(112,26,117,0.25)] absolute bottom-8 right-8"
          onClick={() => setIsOpen(true)}
        >
          See all photos
        </MainButton>
      )}
      className="fixed top-0 left-0 w-screen h-screen bg-fuchsia-50 z-10"
      renderContent={(setup) => (
        <div className="relative w-full h-full overflow-y-auto md:p-16 md:flex md:flex-col md:flex-nowrap lg:max-w-[1200px] lg:mx-auto">
          <div className="absolute top-8 right-8 z-20 md:static md:text-right md:pb-16">
            <MainButton
              ref={setup.firstFocusable}
              onKeyDown={setup.onShiftTab}
              bgColor={{
                base: 'bg-fuchsia-50',
                states: 'hover:bg-fuchsia-900',
              }}
              textColor={{
                base: 'text-fuchsia-600',
                states: 'hover:text-fuchsia-50',
              }}
              radius="rounded-full"
              padding="p-4 md:p-0"
              className="w-48 h-48 shadow-[0_2px_8px_rgba(112,26,117,0.25)] md:shadow-none md:align-bottom"
              onClick={(e) => {
                setup.setIsOpen(false)
                e.stopPropagation()
              }}
              aria-label="Close"
            >
              <X className="w-full h-full" />
            </MainButton>
          </div>
          <ul className="md:flex md:flex-row md:flex-wrap md:justify-center md:content-center md:gap-16 lg:gap-24">
            {images.map((image, i) => (
              <li
                key={image}
                className="md:w-[calc(50%-8px)] lg:w-[calc(50%-12px)]"
              >
                <Modal<HTMLButtonElement>
                  id={`originalImage${i}SizeModal`}
                  openerId={`image${i}Opener`}
                  isFirstFocusableFocused
                  renderOpener={(setIsOpen) => (
                    <button
                      ref={
                        i === 0
                          ? setup.focused
                          : i === images.length - 1
                          ? setup.lastFocusable
                          : undefined
                      }
                      onKeyDown={
                        i === images.length - 1 ? setup.onTab : undefined
                      }
                      id={`image${i}Opener`}
                      onClick={(e) => {
                        setIsOpen(true)
                        e.stopPropagation()
                      }}
                      aria-label="View in original size"
                      className="relative w-full h-[300px] focus:border-4 focus:border-dashed focus:border-fuchsia-600"
                    >
                      <Image
                        src={image}
                        alt=""
                        layout="fill"
                        objectFit="cover"
                        className="md:rounded-16"
                      />
                    </button>
                  )}
                  className="fixed top-0 left-0 w-screen h-screen bg-fuchsia-50 z-30"
                  renderContent={(setup) => (
                    <div className="relative pb-8 flex flex-col flex-nowrap w-full h-full md:pb-16 lg:max-w-[1200px] lg:mx-auto">
                      <div className="p-8 text-right md:p-16">
                        <MainButton
                          ref={setup.firstFocusable}
                          onKeyDown={(e) => {
                            setup.onTab(e)
                            setup.onShiftTab(e)
                          }}
                          bgColor={{
                            base: 'bg-fuchsia-50',
                            states: 'hover:bg-fuchsia-900',
                          }}
                          textColor={{
                            base: 'text-fuchsia-600',
                            states: 'hover:text-fuchsia-50',
                          }}
                          radius="rounded-full"
                          padding="p-0"
                          className="w-48 h-48 align-bottom"
                          onClick={(e) => {
                            setup.setIsOpen(false)
                            e.stopPropagation()
                          }}
                          aria-label="Close"
                        >
                          <X className="w-full h-full" />
                        </MainButton>
                      </div>
                      <div className="h-full relative">
                        <Image
                          src={image}
                          alt=""
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  )
}

export default PostsSeeAllPhotosModal
