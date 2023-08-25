import Image from 'next/image'
import addSpacesToNum from 'utils/functions/addSpacesToNum'
import formatToUrl from 'utils/functions/formatToUrl'
import Link from 'next/link'
import Location from 'public/static/images/location.svg'
import Popup from 'components/Popup'

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

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
        arrowClassName="w-8 absolute before:absolute before:visible before:w-8 before:h-8 before:bg-fuchsia-900 before:rotate-45 -z-10"
        referenceContent={<Location className="w-24 h-24 text-fuchsia-600" />}
        popupClassName="lg:flex lg:justify-center"
        popupContent={
          <div className="max-w-[300px] bg-fuchsia-900 text-fuchsia-50 rounded py-4 px-8 break-words">
            {address}
          </div>
        }
      />
      <Image
        src={awsUrl + image}
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
