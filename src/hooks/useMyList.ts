import { useStore } from '../store/useStore'

export function useMyList() {
  const myList = useStore((state) => state.myList)
  const addToMyList = useStore((state) => state.addToMyList)
  const removeFromMyList = useStore((state) => state.removeFromMyList)
  const isInMyList = useStore((state) => state.isInMyList)
  const clearMyList = useStore((state) => state.clearMyList)

  return {
    myList,
    addToMyList,
    removeFromMyList,
    isInMyList,
    clearMyList,
  }
}
