export interface PlayerRetryDecision {
  canRetry: boolean
  delayMs: number
}

export function getPlayerRetryDecision(attempt: number, isOnline: boolean): PlayerRetryDecision {
  const MAX_ATTEMPTS = 4
  
  if (!isOnline || attempt >= MAX_ATTEMPTS) {
    return { canRetry: false, delayMs: 0 }
  }

  // Exponential backoff: 1.5s, 3s, 6s, 12s
  const delayMs = 1500 * Math.pow(2, attempt)

  return {
    canRetry: true,
    delayMs,
  }
}
