import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import type { MyListItem, WatchHistoryItem } from '../store/useStore';

export function useSupabaseSync() {
  const user = useStore((state) => state.user);
  const addToMyList = useStore((state) => state.addToMyList);
  const setWatchProgress = useStore((state) => state.setWatchProgress);
  const addToWatchHistory = useStore((state) => state.addToWatchHistory);

  useEffect(() => {
    if (!user) return;

    // Sync favorites from Supabase
    async function syncFavorites() {
      if (!user) return;
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error syncing favorites:', error);
        return;
      }

      if (data) {
        const favorites = data.map((item): MyListItem => ({
          id: item.item_id,
          title: item.title,
          poster: item.poster || '',
          type: item.type,
          addedAt: new Date(item.added_at).getTime(),
        }));
        // Clear and add all favorites
        favorites.forEach((item) => addToMyList(item));
      }
    }

    // Sync watch progress from Supabase
    async function syncWatchProgress() {
      if (!user) return;
      const { data, error } = await supabase
        .from('watch_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error syncing watch progress:', error);
        return;
      }

      if (data) {
        data.forEach((item) => {
          setWatchProgress(item.item_id, item.progress);
        });
      }
    }

    // Sync watch history from Supabase
    async function syncWatchHistory() {
      if (!user) return;
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error syncing watch history:', error);
        return;
      }

      if (data) {
        const history = data.map((item): WatchHistoryItem => ({
          id: item.item_id,
          title: item.title,
          poster: item.poster || '',
          type: item.type,
          timestamp: item.timestamp,
        }));
        history.forEach((item) => addToWatchHistory(item));
      }
    }

    syncFavorites();
    syncWatchProgress();
    syncWatchHistory();
  }, [user, addToMyList, setWatchProgress, addToWatchHistory]);
}

export function useSupabaseRealtime() {
  const user = useStore((state) => state.user);
  const addToMyList = useStore((state) => state.addToMyList);
  const removeFromMyList = useStore((state) => state.removeFromMyList);
  const setWatchProgress = useStore((state) => state.setWatchProgress);

  useEffect(() => {
    if (!user) return;

    // Subscribe to favorites changes
    const favoritesSubscription = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as any;
            addToMyList({
              id: newItem.item_id,
              title: newItem.title,
              poster: newItem.poster || '',
              type: newItem.type,
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as any;
            removeFromMyList(deletedItem.item_id);
          }
        }
      )
      .subscribe();

    // Subscribe to watch progress changes
    const progressSubscription = supabase
      .channel('progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watch_progress',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as any;
            setWatchProgress(newItem.item_id, newItem.progress);
          }
        }
      )
      .subscribe();

    return () => {
      favoritesSubscription.unsubscribe();
      progressSubscription.unsubscribe();
    };
  }, [user, addToMyList, removeFromMyList, setWatchProgress]);
}
