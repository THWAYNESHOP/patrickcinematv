import { useStore } from '../store/useStore';

export interface ContinueWatchingItem {
  id: string;
  title: string;
  poster: string;
  type: 'movie' | 'tv' | 'sports';
  progress: number; // 0-100
  timestamp: number;
  duration?: number;
}

export function useContinueWatching() {
  const continueWatching = useStore((state) => state.continueWatching);
  const addToContinueWatching = useStore((state) => state.addToContinueWatching);
  const removeFromContinueWatching = useStore((state) => state.removeFromContinueWatching);
  const clearContinueWatching = useStore((state) => state.clearContinueWatching);

  const updateProgress = (item: Omit<ContinueWatchingItem, 'timestamp'>) => {
    // Map the interface to match store expectations
    addToContinueWatching({
      id: item.id,
      title: item.title,
      poster: item.poster,
      type: item.type,
      progress: item.progress,
    });
  };

  return {
    continueWatching,
    updateProgress,
    removeFromContinueWatching,
    clearContinueWatching,
  };
}
