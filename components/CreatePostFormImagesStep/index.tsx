import InputError from 'components/InputError'
import Image from 'next/image'
import type { CreatePost } from 'schemas/client/createPost'
import PlusCircle from 'public/static/images/plus-circle.svg'
import { useFormContext } from 'react-hook-form'
import { useRef, useState } from 'react'
import WizardStep from 'components/WizardStep'
import WizardPrevButton from 'components/WizardPrevButton'
import WizardNextButton from 'components/WizardNextButton'
import blobToDataUrl from 'functions/blobToDataUrl'

export default function CreatePostFormImagesStep() {
  const [imageSources, setImageSources] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { register, trigger, getValues } = useFormContext<CreatePost>()

  function handleKeyDown(e: React.KeyboardEvent<HTMLLabelElement>) {
    if (e.key === 'Enter') {
      inputRef.current?.click()
    }
  }

  async function onChange() {
    const isValid = await trigger('images')

    if (!isValid) {
      setImageSources([])
      return
    }

    const imageSources = await Promise.all(
      Array.from(getValues('images')).map(blobToDataUrl)
    )

    setImageSources(imageSources)
  }

  const images: React.ReactNode[] = []

  for (let i = 0; i < 5; i++) {
    images.push(
      imageSources[i] ? (
        <div
          key={i}
          className="relative w-[calc(50%-4px)] h-[calc((100%/3)-(16px/3))]"
        >
          <Image
            src={imageSources[i]}
            alt=""
            fill
            className="rounded-8 object-cover"
          />
        </div>
      ) : (
        <div
          key={i}
          className="w-[calc(50%-4px)] h-[calc((100%/3)-(16px/3))] bg-fuchsia-200 text-fuchsia-900 font-bold rounded-8 flex flex-col justify-center items-center md:bg-fuchsia-100"
        >
          <PlusCircle className="w-24 h-24 mb-4" />
          Photo n°{i + 1}
        </div>
      )
    )
  }

  const inputProps = register('images', { onChange })

  return (
    <WizardStep className="flex flex-col gap-y-16 h-full">
      <h2>Images</h2>
      <label
        tabIndex={0}
        htmlFor="images"
        onKeyDown={handleKeyDown}
        aria-label="Images"
        className="grow flex flex-row flex-wrap gap-8 cursor-pointer"
      >
        {images}
      </label>
      <input
        type="file"
        multiple
        {...inputProps}
        ref={(e) => {
          inputProps.ref(e)
          inputRef.current = e
        }}
        id="images"
        className="hidden"
      />
      <InputError<CreatePost> name="images" />
      <div className="flex gap-x-16">
        <WizardPrevButton className="secondary-btn w-full">
          ← Back
        </WizardPrevButton>
        <WizardNextButton
          className="primary-btn w-full"
          isDisabled={!imageSources.length}
        >
          Next →
        </WizardNextButton>
      </div>
    </WizardStep>
  )
}
