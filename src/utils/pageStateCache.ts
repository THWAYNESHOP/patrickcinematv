type PageState = {
  scrollY?: number
  carouselPositions?: Record<string, number>
  focusedCardIds?: Record<string, string>
  data?: Record<string, unknown>
  lastUpdated?: number
}

const pageStateCache = new Map<string, PageState>()

export function getPageState<T extends PageState = PageState>(key: string): T | null {
  return (pageStateCache.get(key) as T) || null
}

export function setPageState(key: string, state: Partial<PageState>): void {
  const existing = pageStateCache.get(key) || {}
  pageStateCache.set(key, {
    ...existing,
    ...state,
    carouselPositions: {
      ...(existing.carouselPositions || {}),
      ...(state.carouselPositions || {}),
    },
    focusedCardIds: {
      ...(existing.focusedCardIds || {}),
      ...(state.focusedCardIds || {}),
    },
    data: {
      ...(existing.data || {}),
      ...(state.data || {}),
    },
    lastUpdated: Date.now(),
  })
}

export function clearPageState(key?: string): void {
  if (key) {
    pageStateCache.delete(key)
    return
  }

  pageStateCache.clear()
}
