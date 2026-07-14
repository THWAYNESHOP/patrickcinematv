import { useStore } from '../store/useStore';
export type { WatchHistoryItem } from '../types/watchHistory'

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
