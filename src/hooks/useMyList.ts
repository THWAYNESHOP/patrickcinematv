import { useState, useEffect } from 'react'
import { storage } from '../utils/localStorage'

export function useMyList() {
  const [myList, setMyList] = useState<any[]>([])

  useEffect(() => {
    setMyList(storage.getMyList())
  }, [])

  const addToMyList = (item: any) => {
    storage.addToMyList(item)
    setMyList(storage.getMyList())
  }

  const removeFromMyList = (id: string) => {
    storage.removeFromMyList(id)
    setMyList(storage.getMyList())
  }

  const isInMyList = (id: string) => {
    return storage.isInMyList(id)
  }

  return {
    myList,
    addToMyList,
    removeFromMyList,
    isInMyList,
  }
}
