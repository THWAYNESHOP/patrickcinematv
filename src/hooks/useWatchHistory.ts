import { useStore } from '../store/useStore';

export interface WatchHistoryItem {
  id: string;
  title: string;
  poster: string;
  type: 'movie' | 'tv' | 'sports';
  timestamp: number;
  duration?: number;
}

export function useWatchHistory() {
  const watchHistory = useStore((state) => state.watchHistory);
  const addToWatchHistory = useStore((state) => state.addToWatchHistory);
  const removeFromWatchHistory = useStore((state) => state.removeFromWatchHistory);
  const clearWatchHistory = useStore((state) => state.clearWatchHistory);
  const clearOldHistory = useStore((state) => state.clearOldHistory);

  return {
    watchHistory,
    addToWatchHistory,
    removeFromWatchHistory,
    clearWatchHistory,
    clearOldHistory,
  };
}
