import { useState, useEffect } from 'react'
import ContentCarousel from '../components/Home/ContentCarousel'

export default function MyList() {
  const [myList, setMyList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const savedList = localStorage.getItem('patrickCinemaMyList')
    if (savedList) {
      setMyList(JSON.parse(savedList))
    }
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
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">My List</h1>
        {myList.length > 0 ? (
          <ContentCarousel title="Your List" items={myList} type="movie" />
        ) : (
          <div className="glass rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">Your list is empty</p>
            <p className="text-gray-500 text-sm mt-2">Add movies and shows to your list to see them here</p>
          </div>
        )}
      </div>
    </div>
  )
}
