import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
  effect?: 'blur' | 'opacity' | 'black-and-white'
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  effect = 'blur'
}: OptimizedImageProps) {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      effect={effect}
      placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
      wrapperClassName="image-wrapper"
    />
  )
}
