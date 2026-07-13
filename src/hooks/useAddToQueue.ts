import { useQueue } from '../store/queueStore'
import { useToast } from './useToast'

export function useAddToQueue() {
  const { addToQueue } = useQueue()
  const toast = useToast()

  const add = (item: {
    id: number
    title: string
    type: 'movie' | 'tv' | 'anime' | 'sports'
    poster?: string
    priority?: 'normal' | 'high' | 'low'
  }) => {
    addToQueue({
      ...item,
      priority: item.priority || 'normal',
    })
    toast.success(`${item.title} added to queue`)
  }

  return { addToQueue: add }
}
