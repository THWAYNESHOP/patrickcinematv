import { onRequest as handleRequest } from './index.js'

export async function onRequest(context) {
  return handleRequest(context)
}
