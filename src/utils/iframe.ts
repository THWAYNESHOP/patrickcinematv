export function sanitizeIframeSrc(src: string): string {
  if (!src) return src

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(src)
  const hasLeadingSlash = src.startsWith('/')

  if (!hasProtocol && !hasLeadingSlash) {
    return src
  }

  try {
    const url = new URL(src, window.location.href)
    const params = url.searchParams

    const blockedParams = ['sandbox', 'allow', 'allowfullscreen', 'allowFullScreen']
    blockedParams.forEach((param) => params.delete(param))

    url.search = params.toString()
    return url.toString()
  } catch {
    return src
  }
}
