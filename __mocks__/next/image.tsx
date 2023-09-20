import type { ImageProps } from 'next/image'

export default function Image({
  src,
  alt,
  title,
  className,
}: Omit<ImageProps, 'src'> & { src?: string; className?: string }) {
  return <img src={src} alt={alt} title={title} className={className} />
}
