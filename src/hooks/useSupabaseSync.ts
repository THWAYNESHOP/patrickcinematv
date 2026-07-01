import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MyListItem, WatchHistoryItem } from '../store/useStore';

const normalizeType = (input: unknown): 'movie' | 'tv' | 'sports' | 'anime' => {
  const s = String(input || '')
  if (s === 'tv' || s === 'sports' || s === 'anime') return s as 'tv' | 'sports' | 'anime'
  return 'movie'
}



interface SupabaseFavoriteRow {
  item_id: string
  title?: string
  poster?: string
  type?: string
  added_at?: string
}

interface SupabaseProgressRow {
  item_id: string
  progress: number
}

interface SupabaseHistoryRow {
  item_id: string
  title?: string
  poster?: string
  type?: string
  timestamp?: string
}

export function useSupabaseSync() {
  const user = useStore((state) => state.user);
  const addToMyList = useStore((state) => state.addToMyList);
  const setWatchProgress = useStore((state) => state.setWatchProgress);
  const addToWatchHistory = useStore((state) => state.addToWatchHistory);



  useEffect(() => {
    if (!user || !isSupabaseConfigured || !supabase) return;

    const client = supabase;

    // Sync favorites from Supabase
    async function syncFavorites() {
      if (!user) return;
      const { data, error } = await client
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error syncing favorites:', error);
        return;
      }

      if (data) {
        const favorites = (data as SupabaseFavoriteRow[]).map((item): MyListItem => ({
          id: item.item_id,
          title: item.title || '',
          poster: item.poster || '',
          type: normalizeType(item.type),
          addedAt: item.added_at ? new Date(item.added_at).getTime() : Date.now(),
        }));
        // Clear and add all favorites
        favorites.forEach((item) => addToMyList(item));
      }
    }

    // Sync watch progress from Supabase
    async function syncWatchProgress() {
      if (!user) return;
      const { data, error } = await client
        .from('watch_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error syncing watch progress:', error);
        return;
      }

      if (data) {
        ;(data as SupabaseProgressRow[]).forEach((item) => {
          setWatchProgress(item.item_id, item.progress);
        });
      }
    }

    // Sync watch history from Supabase
    async function syncWatchHistory() {
      if (!user) return;
      const { data, error } = await client
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
        const history = (data as SupabaseHistoryRow[]).map((item): WatchHistoryItem => ({
          id: item.item_id,
          title: item.title || '',
          poster: item.poster || '',
          type: normalizeType(item.type),
          timestamp: item.timestamp ? Number(item.timestamp) : Date.now(),
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
    if (!user || !isSupabaseConfigured || !supabase) return;

    const client = supabase;

    // Subscribe to favorites changes
    const favoritesSubscription = client
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
            const newItem = payload.new as SupabaseFavoriteRow;
            addToMyList({
              id: newItem.item_id,
              title: newItem.title || '',
              poster: newItem.poster || '',
              type: normalizeType(newItem.type),
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as SupabaseFavoriteRow;
            removeFromMyList(deletedItem.item_id);
          }
        }
      )
      .subscribe();

    // Subscribe to watch progress changes
    const progressSubscription = client
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
            const newItem = payload.new as SupabaseProgressRow;
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
