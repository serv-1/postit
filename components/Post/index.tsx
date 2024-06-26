import Image from 'next/image'
import addSpacesToNum from 'functions/addSpacesToNum'
import formatToUrl from 'functions/formatToUrl'
import Link from 'next/link'
import Location from 'public/static/images/location.svg'
import Popup from 'components/Popup'
import { NEXT_PUBLIC_AWS_URL } from 'env/public'

interface PostProps {
  id: string
  name: string
  price: number
  image: string
  address: string
}

export default function Post({ id, name, price, image, address }: PostProps) {
  return (
    <figure className="relative">
      <Popup
        openOnHover
        placement="bottom"
        containerClassName="absolute w-full top-8 left-8 z-10"
        arrowClassName="w-8 absolute -top-4 before:absolute before:visible before:w-8 before:h-8 before:bg-fuchsia-900 before:rotate-45 -z-10"
        referenceContent={<Location className="w-24 h-24 text-fuchsia-600" />}
        popupClassName="mt-4"
        popupContent={
          <div className="bg-fuchsia-900 text-fuchsia-50 rounded py-4 px-8 break-words">
            {address}
          </div>
        }
      />
      <Image
        src={NEXT_PUBLIC_AWS_URL + '/' + image}
        alt={name}
        width="328"
        height="328"
        className="rounded-8 z-[-1] aspect-square object-cover"
      />
      <figcaption className="px-8 py-4 text-center">
        <Link
          href={`/posts/${id}/${formatToUrl(name)}`}
          className="text-fuchsia-600 hover:underline flex flex-row flex-nowrap justify-center"
        >
          <span className="truncate">{name}</span>
          <span>&nbsp;-&nbsp;</span>
          <span>{addSpacesToNum(price)}€</span>
        </Link>
      </figcaption>
    </figure>
  )
}
