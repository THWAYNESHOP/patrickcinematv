# State Management Documentation

## Overview

NEXASTREAM uses Zustand for global state management with persistence via localStorage. The state is organized by feature domains with clear separation of concerns.

## Store Structure

The main store is defined in `src/store/useStore.ts` and includes the following domains:

### My List / Favorites
Manages user's favorite content items.

```typescript
interface MyListItem {
  id: string
  title: string
  poster: string
  type: MediaType
  addedAt: number
  rating?: string
  year?: number
}
```

**Actions:**
- `addToMyList(item)`: Add item to favorites
- `removeFromMyList(id)`: Remove item from favorites
- `isInMyList(id)`: Check if item is in favorites
- `clearMyList()`: Clear all favorites

### Reviews / Ratings
Manages user reviews and ratings for content.

```typescript
interface ReviewItem {
  id: string
  mediaId: string
  mediaType: MediaType
  mediaTitle: string
  mediaPoster: string
  rating: number // 1-5 stars
  reviewText: string
  createdAt: number
  userId?: string
}
```

**Actions:**
- `addReview(review)`: Add or update a review
- `updateReview(reviewId, updates)`: Update existing review
- `removeReview(reviewId)`: Remove a review
- `getReviewsForMedia(mediaId)`: Get all reviews for a media item
- `getAverageRatingForMedia(mediaId)`: Get average rating for a media item

### Watch Progress
Tracks playback progress for content.

```typescript
watchProgress: Record<string, number> // itemId -> progress (0-100)
```

**Actions:**
- `setWatchProgress(itemId, progress)`: Set progress for an item
- `getWatchProgress(itemId)`: Get progress for an item
- `clearWatchProgress(itemId)`: Clear progress for an item

### Playback Preferences
User's playback settings.

```typescript
playbackPreferences: {
  autoplay: boolean
  lowDataMode: boolean
  defaultQuality: 'auto' | 'low' | 'medium' | 'high'
}
```

**Actions:**
- `setPlaybackPreferences(preferences)`: Update playback preferences

### Continue Watching
Manages the "Continue Watching" list with last 20 items.

```typescript
interface ContinueWatchingItem {
  id: string
  title: string
  poster: string
  type: MediaType
  progress: number
  lastWatched: number
}
```

**Actions:**
- `addToContinueWatching(item)`: Add or update item in continue watching
- `removeFromContinueWatching(id)`: Remove item from continue watching
- `clearContinueWatching()`: Clear all continue watching items

### Watch History
Tracks complete watch history with last 50 items.

```typescript
interface WatchHistoryItem {
  id: string
  title: string
  poster: string
  type: MediaType
  timestamp: number
}
```

**Actions:**
- `addToWatchHistory(item)`: Add item to watch history
- `removeFromWatchHistory(id)`: Remove item from watch history
- `clearWatchHistory()`: Clear all watch history
- `clearOldHistory(daysToKeep)`: Clear history older than specified days

### User State
Manages authenticated user information.

```typescript
user: null | {
  id: string
  email: string
  name?: string
}
```

**Actions:**
- `setUser(user)`: Set current user

### Notification Preferences
User's notification settings.

```typescript
notificationPreferences: {
  sports: boolean
  newReleases: boolean
  favoriteShows: boolean
}
```

**Actions:**
- `setNotificationPreferences(preferences)`: Update notification preferences

### Supabase Sync
Functions for syncing local state with Supabase backend.

**Actions:**
- `syncWithSupabase()`: Sync local state to Supabase
- `clearSupabaseData()`: Clear user data from Supabase

## Usage Examples

### Using the Store

```typescript
import { useStore } from '@/store/useStore'

function MyComponent() {
  const myList = useStore(state => state.myList)
  const addToMyList = useStore(state => state.addToMyList)
  const isInMyList = useStore(state => state.isInMyList)

  const handleAdd = (item) => {
    addToMyList(item)
  }

  return (
    <div>
      {myList.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  )
}
```

### Using Selectors for Performance

```typescript
// Select specific state to avoid unnecessary re-renders
const myList = useStore(state => state.myList)
const addToMyList = useStore(state => state.addToMyList)

// Or use shallow comparison for arrays/objects
import { shallow } from 'zustand/shallow'
const { myList, addToMyList } = useStore(
  state => ({ myList: state.myList, addToMyList: state.addToMyList }),
  shallow
)
```

### Syncing with Supabase

```typescript
const syncWithSupabase = useStore(state => state.syncWithSupabase)

// Sync when user logs in
useEffect(() => {
  if (user) {
    syncWithSupabase()
  }
}, [user, syncWithSupabase])
```

## Persistence

The store uses Zustand's persist middleware to save state to localStorage:

```typescript
persist(
  (set, get) => ({ /* store implementation */ }),
  {
    name: 'nexastream-storage',
    partialize: (state) => ({
      myList: state.myList,
      watchProgress: state.watchProgress,
      continueWatching: state.continueWatching,
      watchHistory: state.watchHistory,
      user: state.user,
      notificationPreferences: state.notificationPreferences,
      playbackPreferences: state.playbackPreferences,
      reviews: state.reviews,
    }),
  }
)
```

## Best Practices

1. **Use Selectors**: Always use selectors to access specific state slices to avoid unnecessary re-renders
2. **Shallow Comparison**: Use shallow comparison when selecting multiple state values
3. **Keep Actions Pure**: Store actions should be pure functions that only modify state
4. **Sync Strategically**: Sync with backend only when necessary (login, logout, explicit save)
5. **Clear Old Data**: Implement cleanup for old data to prevent storage bloat

## Queue Store

Separate store for playback queue management in `src/store/queueStore.ts`.

```typescript
interface QueueStore {
  queue: QueueItem[]
  currentIndex: number
  addToQueue: (item: QueueItem) => void
  removeFromQueue: (index: number) => void
  playNext: () => void
  playPrevious: () => void
  clearQueue: () => void
}
```

## Future Improvements

- Add Redux DevTools integration for debugging
- Implement optimistic updates for better UX
- Add state versioning for migrations
- Consider splitting into multiple stores by domain
- Add computed/selectors for derived state
