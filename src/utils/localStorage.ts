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
  getMyList: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MY_LIST)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  setMyList: (list: any[]): void => {
    localStorage.setItem(STORAGE_KEYS.MY_LIST, JSON.stringify(list))
  },

  addToMyList: (item: any): void => {
    const list = storage.getMyList()
    if (!list.find((i) => String(i.id) === String(item.id))) {
      list.push(item)
      storage.setMyList(list)
    }
  },

  removeFromMyList: (id: string): void => {
    const list = storage.getMyList().filter((item) => String(item.id) !== String(id))
    storage.setMyList(list)
  },

  isInMyList: (id: string): boolean => {
    return storage.getMyList().some((item) => String(item.id) === String(id))
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

  getContinueWatching: (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTINUE_WATCHING)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  setContinueWatching: (items: any[]): void => {
    localStorage.setItem(STORAGE_KEYS.CONTINUE_WATCHING, JSON.stringify(items))
  },

  addToContinueWatching: (item: any): void => {
    const list = storage.getContinueWatching()
    const existingIndex = list.findIndex((i) => i.id === item.id)
    
    if (existingIndex >= 0) {
      list[existingIndex] = { ...item, lastWatched: Date.now() }
    } else {
      list.push({ ...item, lastWatched: Date.now() })
    }
    
    // Sort by last watched
    list.sort((a, b) => b.lastWatched - a.lastWatched)
    storage.setContinueWatching(list.slice(0, 20)) // Keep only last 20
  },
}
