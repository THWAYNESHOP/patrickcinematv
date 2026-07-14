import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WatchHistoryItem, MediaType } from '../types/watchHistory';

export type { WatchHistoryItem, MediaType } from '../types/watchHistory';

export interface ContinueWatchingItem {
  id: string;
  title: string;
  poster: string;
  type: MediaType;
  progress: number;
  lastWatched: number;
}

export interface MyListItem {
  id: string;
  title: string;
  poster: string;
  type: MediaType;
  addedAt: number;
  rating?: string;
  year?: number;
}

export interface ReviewItem {
  id: string; // unique review ID (usually mediaId_timestamp)
  mediaId: string;
  mediaType: MediaType;
  mediaTitle: string;
  mediaPoster: string;
  rating: number; // 1-5 stars
  reviewText: string;
  createdAt: number;
  userId?: string; // optional, for future user auth
}

interface AppState {
  // My List / Favorites
  myList: MyListItem[];
  addToMyList: (item: Omit<MyListItem, 'addedAt'>) => void;
  removeFromMyList: (id: string) => void;
  isInMyList: (id: string) => boolean;
  clearMyList: () => void;

  // Reviews/Ratings
  reviews: ReviewItem[];
  addReview: (review: Omit<ReviewItem, 'id' | 'createdAt'>) => void;
  updateReview: (reviewId: string, updates: Partial<ReviewItem>) => void;
  removeReview: (reviewId: string) => void;
  getReviewsForMedia: (mediaId: string) => ReviewItem[];
  getAverageRatingForMedia: (mediaId: string) => number;

  // Watch Progress
  watchProgress: Record<string, number>;
  setWatchProgress: (itemId: string, progress: number) => void;
  getWatchProgress: (itemId: string) => number;
  clearWatchProgress: (itemId: string) => void;

  // Playback Preferences
  playbackPreferences: {
    autoplay: boolean;
    lowDataMode: boolean;
    defaultQuality: 'auto' | 'low' | 'medium' | 'high';
  };
  setPlaybackPreferences: (preferences: AppState['playbackPreferences']) => void;

  // Continue Watching
  continueWatching: ContinueWatchingItem[];
  addToContinueWatching: (item: Omit<ContinueWatchingItem, 'lastWatched'>) => void;
  removeFromContinueWatching: (id: string) => void;
  clearContinueWatching: () => void;

  // Watch History
  watchHistory: WatchHistoryItem[];
  addToWatchHistory: (item: Omit<WatchHistoryItem, 'timestamp'>) => void;
  removeFromWatchHistory: (id: string) => void;
  clearWatchHistory: () => void;
  clearOldHistory: (daysToKeep?: number) => void;

  // User State (for Supabase integration later)
  user: null | {
    id: string;
    email: string;
    name?: string;
  };
  setUser: (user: AppState['user']) => void;

  // Notification preferences
  notificationPreferences: {
    sports: boolean;
    newReleases: boolean;
    favoriteShows: boolean;
  };
  setNotificationPreferences: (preferences: AppState['notificationPreferences']) => void;

  // Supabase sync functions
  syncWithSupabase: () => Promise<void>;
  clearSupabaseData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // My List / Favorites
      myList: [],
      addToMyList: (item) => {
        const newItem = { ...item, addedAt: Date.now() };
        set((state) => {
          if (state.myList.find((i) => i.id === item.id)) {
            return state;
          }
          return { myList: [...state.myList, newItem] };
        });
      },
      removeFromMyList: (id) => {
        set((state) => ({
          myList: state.myList.filter((item) => item.id !== id),
        }));
      },
      isInMyList: (id) => {
        return get().myList.some((item) => item.id === id);
      },
      clearMyList: () => {
        set({ myList: [] });
      },

      // Reviews/Ratings
      reviews: [],
      addReview: (review) => {
        const newReview: ReviewItem = {
          ...review,
          id: `${review.mediaId}_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => {
          // Check if there's already a review for this media to replace it
          const existingIndex = state.reviews.findIndex(
            (r) => r.mediaId === review.mediaId
          );
          if (existingIndex !== -1) {
            const updated = [...state.reviews];
            updated[existingIndex] = newReview;
            return { reviews: updated };
          }
          return { reviews: [...state.reviews, newReview] };
        });
      },
      updateReview: (reviewId, updates) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, ...updates } : r
          ),
        }));
      },
      removeReview: (reviewId) => {
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== reviewId),
        }));
      },
      getReviewsForMedia: (mediaId) => {
        return get().reviews.filter((r) => r.mediaId === mediaId);
      },
      getAverageRatingForMedia: (mediaId) => {
        const mediaReviews = get().reviews.filter((r) => r.mediaId === mediaId);
        if (mediaReviews.length === 0) return 0;
        const sum = mediaReviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / mediaReviews.length;
      },

      // Watch Progress
      watchProgress: {},
      setWatchProgress: (itemId, progress) => {
        set((state) => ({
          watchProgress: { ...state.watchProgress, [itemId]: progress },
        }));
      },
      getWatchProgress: (itemId) => {
        return get().watchProgress[itemId] || 0;
      },
      clearWatchProgress: (itemId) => {
        set((state) => {
          const newProgress = { ...state.watchProgress };
          delete newProgress[itemId];
          return { watchProgress: newProgress };
        });
      },

      // Playback Preferences
      playbackPreferences: {
        autoplay: true,
        lowDataMode: false,
        defaultQuality: 'auto',
      },
      setPlaybackPreferences: (preferences) => {
        set({ playbackPreferences: { ...get().playbackPreferences, ...preferences } });
      },

      // Continue Watching
      continueWatching: [],
      addToContinueWatching: (item) => {
        const newItem = { ...item, lastWatched: Date.now() };
        set((state) => {
          const existingIndex = state.continueWatching.findIndex((i) => i.id === item.id);
          let updated;
          if (existingIndex >= 0) {
            updated = [...state.continueWatching];
            updated[existingIndex] = newItem;
          } else {
            updated = [...state.continueWatching, newItem];
          }
          // Sort by last watched and keep only last 20
          updated.sort((a, b) => b.lastWatched - a.lastWatched);
          return { continueWatching: updated.slice(0, 20) };
        });
      },
      removeFromContinueWatching: (id) => {
        set((state) => ({
          continueWatching: state.continueWatching.filter((item) => item.id !== id),
        }));
      },
      clearContinueWatching: () => {
        set({ continueWatching: [] });
      },

      // Watch History
      watchHistory: [],
      addToWatchHistory: (item) => {
        const newItem = { ...item, timestamp: Date.now() };
        set((state) => {
          const existingIndex = state.watchHistory.findIndex((i) => i.id === item.id);
          let updated;
          if (existingIndex >= 0) {
            // Move to top if already exists
            updated = [newItem, ...state.watchHistory.filter((i) => i.id !== item.id)];
          } else {
            updated = [newItem, ...state.watchHistory];
          }
          // Keep only last 50 items
          return { watchHistory: updated.slice(0, 50) };
        });
      },
      removeFromWatchHistory: (id) => {
        set((state) => ({
          watchHistory: state.watchHistory.filter((item) => item.id !== id),
        }));
      },
      clearWatchHistory: () => {
        set({ watchHistory: [] });
      },
      clearOldHistory: (daysToKeep = 30) => {
        const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
        set((state) => ({
          watchHistory: state.watchHistory.filter((item) => item.timestamp > cutoffTime),
        }));
      },

      // User State
      user: null,
      setUser: (user) => {
        set({ user });
      },

      // Notification preferences
      notificationPreferences: {
        sports: true,
        newReleases: true,
        favoriteShows: true,
      },
      setNotificationPreferences: (preferences: AppState['notificationPreferences']) => {
        set({ notificationPreferences: preferences });
      },

      // Supabase sync functions
      syncWithSupabase: async () => {
        const { user, myList, watchProgress, watchHistory } = get();
        if (!user) return;

        try {
          const { supabase } = await import('../lib/supabase');
          if (!supabase) return;

          // Sync favorites
          if (myList.length > 0) {
            for (const item of myList) {
              await supabase.from('favorites').upsert({
                user_id: user.id,
                item_id: item.id,
                title: item.title,
                poster: item.poster,
                type: item.type,
                added_at: new Date(item.addedAt).toISOString(),
              });
            }
          }

          // Sync watch progress
          if (Object.keys(watchProgress).length > 0) {
            for (const [itemId, progress] of Object.entries(watchProgress)) {
              await supabase.from('watch_progress').upsert({
                user_id: user.id,
                item_id: itemId,
                progress: progress,
              });
            }
          }

          // Sync watch history
          if (watchHistory.length > 0) {
            for (const item of watchHistory) {
              await supabase.from('watch_history').upsert({
                user_id: user.id,
                item_id: item.id,
                title: item.title,
                poster: item.poster,
                type: item.type,
                timestamp: item.timestamp,
              });
            }
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      },

      clearSupabaseData: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { supabase } = await import('../lib/supabase');
          if (!supabase) return;

          // Clear all user data from Supabase
          await supabase.from('watch_progress').delete().eq('user_id', user.id);
          await supabase.from('favorites').delete().eq('user_id', user.id);
          await supabase.from('watch_history').delete().eq('user_id', user.id);
        } catch (error) {
          console.error('Error clearing Supabase data:', error);
        }
      },
    }),
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
);
