export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.themoviedb.org https://vidfast.pro wss://vidfast.pro",
    "media-src 'self' https: blob: https://vidfast.pro",
    "frame-src 'self' https: https://www.youtube.com",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'ALLOW-FROM https://vidfast.pro',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

export function applySecurityHeaders(response: Response): Response {
  Object.entries(CSP_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
