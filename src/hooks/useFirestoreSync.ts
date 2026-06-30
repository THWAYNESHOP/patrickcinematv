import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import type { MyListItem, WatchHistoryItem } from '../store/useStore';

export function useFirestoreSync() {
  const user = useStore((state) => state.user);
  const addToMyList = useStore((state) => state.addToMyList);
  const setWatchProgress = useStore((state) => state.setWatchProgress);
  const addToWatchHistory = useStore((state) => state.addToWatchHistory);

  useEffect(() => {
    if (!user) return;

    // Sync favorites from Firestore
    async function syncFavorites() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'users', user.id, 'favorites'),
          orderBy('addedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const favorites: MyListItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          favorites.push({
            id: data.itemId,
            title: data.title,
            poster: data.poster || '',
            type: data.type,
            addedAt: data.addedAt?.toMillis() || Date.now(),
          });
        });
        
        // Clear and add all favorites
        favorites.forEach((item) => addToMyList(item));
      } catch (error) {
        console.error('Error syncing favorites:', error);
      }
    }

    // Sync watch progress from Firestore
    async function syncWatchProgress() {
      if (!user) return;
      try {
        const q = query(collection(db, 'users', user.id, 'watchProgress'));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          setWatchProgress(data.itemId, data.progress);
        });
      } catch (error) {
        console.error('Error syncing watch progress:', error);
      }
    }

    // Sync watch history from Firestore
    async function syncWatchHistory() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'users', user.id, 'watchHistory'),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        
        const history: WatchHistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          history.push({
            id: data.itemId,
            title: data.title,
            poster: data.poster || '',
            type: data.type,
            timestamp: data.timestamp?.toMillis() || Date.now(),
          });
        });
        
        history.forEach((item) => addToWatchHistory(item));
      } catch (error) {
        console.error('Error syncing watch history:', error);
      }
    }

    syncFavorites();
    syncWatchProgress();
    syncWatchHistory();
  }, [user, addToMyList, setWatchProgress, addToWatchHistory]);
}

export function useFirestoreRealtime() {
  const user = useStore((state) => state.user);
  const addToMyList = useStore((state) => state.addToMyList);
  const removeFromMyList = useStore((state) => state.removeFromMyList);
  const setWatchProgress = useStore((state) => state.setWatchProgress);

  useEffect(() => {
    if (!user) return;

    // Subscribe to favorites changes
    const favoritesUnsubscribe = onSnapshot(
      query(collection(db, 'users', user.id, 'favorites')),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            addToMyList({
              id: data.itemId,
              title: data.title,
              poster: data.poster || '',
              type: data.type,
            });
          } else if (change.type === 'removed') {
            const data = change.doc.data();
            removeFromMyList(data.itemId);
          }
        });
      },
      (error) => console.error('Favorites subscription error:', error)
    );

    // Subscribe to watch progress changes
    const progressUnsubscribe = onSnapshot(
      query(collection(db, 'users', user.id, 'watchProgress')),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            setWatchProgress(data.itemId, data.progress);
          }
        });
      },
      (error) => console.error('Progress subscription error:', error)
    );

    return () => {
      favoritesUnsubscribe();
      progressUnsubscribe();
    };
  }, [user, addToMyList, removeFromMyList, setWatchProgress]);
}

// Helper functions to sync data to Firestore
export async function syncFavoriteToFirestore(userId: string, item: MyListItem) {
  try {
    const q = query(
      collection(db, 'users', userId, 'favorites'),
      where('itemId', '==', item.id)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'users', userId, 'favorites'), {
        itemId: item.id,
        title: item.title,
        poster: item.poster,
        type: item.type,
        addedAt: new Date(item.addedAt),
      });
    }
  } catch (error) {
    console.error('Error syncing favorite to Firestore:', error);
  }
}

export async function removeFavoriteFromFirestore(userId: string, itemId: string) {
  try {
    const q = query(
      collection(db, 'users', userId, 'favorites'),
      where('itemId', '==', itemId)
    );
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error('Error removing favorite from Firestore:', error);
  }
}

export async function syncWatchProgressToFirestore(userId: string, itemId: string, progress: number) {
  try {
    const q = query(
      collection(db, 'users', userId, 'watchProgress'),
      where('itemId', '==', itemId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'users', userId, 'watchProgress'), {
        itemId,
        progress,
        updatedAt: new Date(),
      });
    } else {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        progress,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error syncing watch progress to Firestore:', error);
  }
}

export async function syncWatchHistoryToFirestore(userId: string, item: WatchHistoryItem) {
  try {
    await addDoc(collection(db, 'users', userId, 'watchHistory'), {
      itemId: item.id,
      title: item.title,
      poster: item.poster,
      type: item.type,
      timestamp: new Date(item.timestamp),
    });
  } catch (error) {
    console.error('Error syncing watch history to Firestore:', error);
  }
}
