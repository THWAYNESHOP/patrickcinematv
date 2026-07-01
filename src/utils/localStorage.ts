const STORAGE_KEYS = {
  MY_LIST: 'nexastreamMyList',
  WATCH_PROGRESS: 'nexastreamWatchProgress',
  CONTINUE_WATCHING: 'nexastreamContinueWatching',
  FAVORITES: 'nexastreamFavorites',
} as const

const LEGACY_KEY_MAP: Record<string, string> = {
  patrickCinemaMyList: STORAGE_KEYS.MY_LIST,
  patrickCinemaWatchProgress: STORAGE_KEYS.WATCH_PROGRESS,
  patrickCinemaContinueWatching: STORAGE_KEYS.CONTINUE_WATCHING,
  patrickCinemaFavorites: STORAGE_KEYS.FAVORITES,
}

function migrateLegacyStorageKeys() {
  for (const [legacyKey, currentKey] of Object.entries(LEGACY_KEY_MAP)) {
    const legacyValue = localStorage.getItem(legacyKey)
    if (legacyValue !== null && localStorage.getItem(currentKey) === null) {
      localStorage.setItem(currentKey, legacyValue)
    }
  }
}

migrateLegacyStorageKeys()

export const storage = {
  getMyList: (): unknown[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MY_LIST)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  setMyList: (list: unknown[]): void => {
    localStorage.setItem(STORAGE_KEYS.MY_LIST, JSON.stringify(list))
  },

  addToMyList: (item: unknown): void => {
    const list = storage.getMyList()
    const id = ((item as unknown) as { id?: string })?.id
    if (!list.find((i) => String(((i as unknown) as { id?: string })?.id) === String(id))) {
      list.push(item)
      storage.setMyList(list)
    }
  },

  removeFromMyList: (id: string): void => {
    const list = storage.getMyList().filter((item) => String(((item as unknown) as { id?: string })?.id) !== String(id))
    storage.setMyList(list)
  },

  isInMyList: (id: string): boolean => {
    return storage.getMyList().some((item) => String(((item as unknown) as { id?: string })?.id) === String(id))
  },

  getWatchProgress: (itemId: string): number => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS)
      const progress = data ? JSON.parse(data) : {}
      return progress[itemId] || 0
    } catch {
      return 0
    }
  },

  setWatchProgress: (itemId: string, progress: number): void => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS)
      const progressMap = data ? JSON.parse(data) : {}
      progressMap[itemId] = progress
      localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progressMap))
    } catch (error) {
      console.error('Error saving watch progress:', error)
    }
  },

  getContinueWatching: (): unknown[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTINUE_WATCHING)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  setContinueWatching: (items: unknown[]): void => {
    localStorage.setItem(STORAGE_KEYS.CONTINUE_WATCHING, JSON.stringify(items))
  },

  addToContinueWatching: (item: unknown): void => {
    const list = storage.getContinueWatching()
    const existingIndex = (list as unknown as Array<{ id?: string; lastWatched?: number }>).findIndex(
      (i) => ((i as unknown) as { id?: string }).id === ((item as unknown) as { id?: string }).id,
    )

    if (existingIndex >= 0) {
      ;(list as unknown as Array<{ lastWatched?: number }>)[existingIndex] = {
        ...((item as unknown) as Record<string, unknown>),
        lastWatched: Date.now(),
      }
    } else {
      list.push({ ...((item as unknown) as Record<string, unknown>), lastWatched: Date.now() })
    }

    // Sort by last watched
    ;(list as unknown as Array<{ lastWatched: number }>).sort((a, b) => b.lastWatched - a.lastWatched)
    storage.setContinueWatching((list as unknown as Array<Record<string, unknown>>).slice(0, 20)) // Keep only last 20
  },
}
