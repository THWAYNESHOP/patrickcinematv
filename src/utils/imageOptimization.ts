// Enhanced image optimization utility with modern format support
interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpg' | 'png'
  lazy?: boolean
  placeholder?: 'blur' | 'color' | 'none'
}

interface OptimizedImageResult {
  src: string
  srcSet?: string
  sizes?: string
  width: number
  height: number
  loading: 'lazy' | 'eager'
  decoding: 'async'
  placeholder?: string
}

// Format support detection
const formatSupport = {
  avif: false,
  webp: false,
}

// Check format support on mount
if (typeof window !== 'undefined') {
  const checkFormatSupport = (format: 'avif' | 'webp') => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    
    try {
      const dataUrl = canvas.toDataURL(`image/${format}`)
      return dataUrl.startsWith(`data:image/${format}`)
    } catch {
      return false
    }
  }
  
  formatSupport.avif = checkFormatSupport('avif')
  formatSupport.webp = checkFormatSupport('webp')
}

// Get optimal format based on browser support
function getOptimalFormat(preferredFormat?: string): string {
  if (preferredFormat && preferredFormat !== 'auto') {
    return preferredFormat
  }
  
  if (formatSupport.avif) return 'avif'
  if (formatSupport.webp) return 'webp'
  return 'jpg'
}

// Generate responsive image URLs
function generateResponsiveUrls(
  baseUrl: string,
  width: number,
  height: number | undefined,
  format: string,
  quality: number
): string {
  const params = new URLSearchParams()
  params.set('format', format)
  params.set('quality', quality.toString())
  params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  
  // Add size parameter for TMDB images
  const size = width >= 1280 ? 'original' : `w${width}`
  const optimizedUrl = baseUrl.replace(/\/(original|w\d+)\//, `/${size}/`)
  
  return `${optimizedUrl}?${params.toString()}`
}

// Generate srcset for responsive images
function generateSrcSet(
  baseUrl: string,
  heights: number[],
  aspectRatio: number,
  format: string,
  quality: number
): string {
  return heights
    .map((h) => {
      const w = Math.round(h * aspectRatio)
      const url = generateResponsiveUrls(baseUrl, w, h, format, quality)
      return `${url} ${w}w`
    })
    .join(', ')
}

// Generate blur placeholder
function generateBlurPlaceholder(): string {
  // For now, return a simple color placeholder
  // In production, this would generate a tiny blur thumbnail
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%231a1a1a" width="1" height="1"/%3E%3C/svg%3E'
}

// Main image optimization function
export function optimizeImage(
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): OptimizedImageResult {
  const {
    width = 500,
    height,
    quality = 85,
    format: preferredFormat = 'auto',
    lazy = true,
    placeholder = 'blur',
  } = options
  
  const optimalFormat = getOptimalFormat(preferredFormat)
  const aspectRatio = height ? width / height : 2 / 3 // Default poster aspect ratio
  
  // Generate main image URL
  const src = generateResponsiveUrls(imageUrl, width, height, optimalFormat, quality)
  
  // Generate responsive srcset
  const heights = [300, 500, 780, 1280]
  const srcSet = generateSrcSet(imageUrl, heights, aspectRatio, optimalFormat, quality)
  
  // Generate sizes attribute
  const sizes = '(max-width: 640px) 144px, (max-width: 768px) 176px, 192px'
  
  // Generate placeholder
  const placeholderData = placeholder === 'blur' ? generateBlurPlaceholder() : undefined
  
  return {
    src,
    srcSet,
    sizes,
    width,
    height: height || Math.round(width / aspectRatio),
    loading: lazy ? 'lazy' : 'eager',
    decoding: 'async',
    placeholder: placeholderData,
  }
}

// Background image optimization for hero sections
export function optimizeBackgroundImage(
  imageUrl: string,
  options: { quality?: number; format?: string } = {}
): {
  backgroundImage: string
  fallbackImage: string
} {
  const { quality = 75, format = 'auto' } = options
  const optimalFormat = getOptimalFormat(format)
  
  // Generate high-quality background
  const highQualityUrl = generateResponsiveUrls(imageUrl, 1920, 1080, optimalFormat, quality)
  
  // Generate fallback for older browsers
  const fallbackUrl = generateResponsiveUrls(imageUrl, 1280, 720, 'jpg', 70)
  
  return {
    backgroundImage: `url('${highQualityUrl}')`,
    fallbackImage: fallbackUrl,
  }
}

// Preload critical images
export function preloadImage(imageUrl: string, priority: 'high' | 'low' = 'low'): void {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = priority === 'high' ? 'preload' : 'prefetch'
  link.as = 'image'
  link.href = imageUrl
  
  if (priority === 'high') {
    document.head.appendChild(link)
  } else {
    // Prefetch with lower priority
    setTimeout(() => {
      document.head.appendChild(link)
    }, 1000)
  }
}

// Image lazy loading observer
const imageObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
              imageObserver?.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )
  : null

export function observeImage(imgElement: HTMLImageElement): void {
  if (imageObserver) {
    imageObserver.observe(imgElement)
  }
}

export function unobserveImage(imgElement: HTMLImageElement): void {
  if (imageObserver) {
    imageObserver.unobserve(imgElement)
  }
}

// Progressive image loading component utilities
export function getProgressiveImageProps(
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): {
  src: string
  srcSet: string
  sizes: string
  placeholder: string
  loading: 'lazy' | 'eager'
  decoding: 'async'
  className: string
  style: React.CSSProperties
} {
  const optimized = optimizeImage(imageUrl, options)
  
  return {
    src: optimized.src,
    srcSet: optimized.srcSet || '',
    sizes: optimized.sizes || '',
    placeholder: optimized.placeholder || '',
    loading: optimized.loading || 'lazy',
    decoding: optimized.decoding || 'async',
    className: 'transition-opacity duration-300',
    style: {
      backgroundImage: optimized.placeholder ? `url('${optimized.placeholder}')` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  }
}