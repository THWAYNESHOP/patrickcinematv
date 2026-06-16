import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchHistoryItem {
  id: string;
  title: string;
  poster: string;
  type: 'movie' | 'tv' | 'sports';
  timestamp: number;
  duration?: number;
}

export interface ContinueWatchingItem {
  id: string;
  title: string;
  poster: string;
  type: 'movie' | 'tv' | 'sports';
  progress: number;
  lastWatched: number;
}

export interface MyListItem {
  id: string;
  title: string;
  poster: string;
  type: 'movie' | 'tv' | 'sports';
  addedAt: number;
  rating?: string;
  year?: number;
}

interface AppState {
  // My List / Favorites
  myList: MyListItem[];
  addToMyList: (item: Omit<MyListItem, 'addedAt'>) => void;
  removeFromMyList: (id: string) => void;
  isInMyList: (id: string) => boolean;
  clearMyList: () => void;

  // Watch Progress
  watchProgress: Record<string, number>;
  setWatchProgress: (itemId: string, progress: number) => void;
  getWatchProgress: (itemId: string) => number;
  clearWatchProgress: (itemId: string) => void;

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

      // Supabase sync functions
      syncWithSupabase: async () => {
        const { user, myList, watchProgress, watchHistory } = get();
        if (!user) return;

        try {
          const { supabase } = await import('../lib/supabase');

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
      }),
    }
  )
);
