import { onRequest as handleTmdbRequest } from './api/tmdb/index.js'

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/tmdb')) {
    return handleTmdbRequest(context)
  }

  return context.next()
}
