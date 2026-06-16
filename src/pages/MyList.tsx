import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ContentCarousel from '../components/Home/ContentCarousel'

export default function MyList() {
  const [myList, setMyList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from Zustand store
    setMyList(useStore.getState().myList)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-6 md:px-12 lg:px-16">
      <div className="container mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-white tracking-tight">My List</h1>
        {myList.length > 0 ? (
          <ContentCarousel title="Your List" items={myList} type="movie" />
        ) : (
          <div className="glass rounded-xl p-16 text-center">
            <p className="text-gray-400 text-xl font-semibold mb-2">Your list is empty</p>
            <p className="text-gray-500 text-base">Add movies and shows to your list to see them here</p>
          </div>
        )}
      </div>
    </div>
  )
}
