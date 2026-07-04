export interface PlayerRetryDecision {
  canRetry: boolean
  delayMs: number
}

export function getPlayerRetryDecision(attempt: number, isOnline: boolean): PlayerRetryDecision {
  if (!isOnline || attempt >= 2) {
    return { canRetry: false, delayMs: 0 }
  }

  return {
    canRetry: true,
    delayMs: attempt === 0 ? 1500 : 4000,
  }
}
