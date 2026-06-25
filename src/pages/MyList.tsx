import { useStore } from '../store/useStore'
import ContentCarousel from '../components/Home/ContentCarousel'

export default function MyList() {
  const myList = useStore((state) => state.myList)

  return (
    <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="container mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-12 text-white tracking-tight">My List</h1>
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
