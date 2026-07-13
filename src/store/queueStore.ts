import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QueueItem {
  id: number
  title: string
  type: 'movie' | 'tv' | 'anime' | 'sports'
  poster?: string
  addedAt: number
  priority: 'normal' | 'high' | 'low'
  notes?: string
}

interface QueueStore {
  items: QueueItem[]
  addToQueue: (item: Omit<QueueItem, 'addedAt'>) => void
  removeFromQueue: (id: number, type: string) => void
  reorderQueue: (items: QueueItem[]) => void
  updatePriority: (id: number, type: string, priority: QueueItem['priority']) => void
  clearQueue: () => void
  getNextItem: () => QueueItem | null
  markWatching: (id: number, type: string) => void
}

export const useQueue = create<QueueStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToQueue: (item) =>
        set((state) => {
          // Prevent duplicates
          if (state.items.some((i) => i.id === item.id && i.type === item.type)) {
            return state
          }
          return {
            items: [...state.items, { ...item, addedAt: Date.now() }],
          }
        }),
      removeFromQueue: (id, type) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.type === type)),
        })),
      reorderQueue: (items) => set({ items }),
      updatePriority: (id, type, priority) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.type === type ? { ...i, priority } : i
          ),
        })),
      clearQueue: () => set({ items: [] }),
      getNextItem: () => {
        const state = get()
        // Sort by priority and addition time
        const sorted = [...state.items].sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 }
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
          return priorityDiff !== 0 ? priorityDiff : a.addedAt - b.addedAt
        })
        return sorted[0] || null
      },
      markWatching: (id, type) => {
        // Move to top and mark as high priority
        set((state) => {
          const item = state.items.find((i) => i.id === id && i.type === type)
          if (!item) return state
          const remaining = state.items.filter((i) => !(i.id === id && i.type === type))
          return {
            items: [{ ...item, priority: 'high' }, ...remaining],
          }
        })
      },
    }),
    {
      name: 'nexastream-queue',
    }
  )
)
