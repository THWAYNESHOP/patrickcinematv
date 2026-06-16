import { useState, useEffect } from 'react';

export interface NotificationPermissionState {
  state: NotificationPermission | 'unsupported';
  granted: boolean;
  canRequest: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermissionState>({
    state: 'default' as NotificationPermission,
    granted: false,
    canRequest: true,
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission({
        state: Notification.permission,
        granted: Notification.permission === 'granted',
        canRequest: Notification.permission === 'default',
      });
    } else {
      setPermission({
        state: 'unsupported',
        granted: false,
        canRequest: false,
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission({
      state: result,
      granted: result === 'granted',
      canRequest: result === 'default',
    });

    return result === 'granted';
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!permission.granted) {
      console.warn('Notification permission not granted');
      return;
    }

    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });
  };

  return {
    permission,
    requestPermission,
    sendNotification,
  };
}

export function useSportsNotifications() {
  const { permission, requestPermission, sendNotification } = useNotifications();

  const notifyLiveMatch = (match: string, team1: string, team2: string) => {
    if (!permission.granted) {
      requestPermission();
      return;
    }

    sendNotification(`🏆 Live Match: ${match}`, {
      body: `${team1} vs ${team2} is now live!`,
      tag: `sports-${match}`,
      requireInteraction: false,
    });
  };

  const notifyMatchStarting = (match: string, startTime: string) => {
    if (!permission.granted) {
      requestPermission();
      return;
    }

    sendNotification(`⚽ Match Starting Soon`, {
      body: `${match} starts at ${startTime}`,
      tag: `sports-start-${match}`,
      requireInteraction: false,
    });
  };

  return {
    permission,
    requestPermission,
    notifyLiveMatch,
    notifyMatchStarting,
  };
}

export function useContentNotifications() {
  const { permission, requestPermission, sendNotification } = useNotifications();

  const notifyNewRelease = (title: string, type: 'movie' | 'tv' | 'anime') => {
    if (!permission.granted) {
      requestPermission();
      return;
    }

    const emoji = type === 'movie' ? '🎬' : type === 'tv' ? '📺' : '🎌';
    sendNotification(`${emoji} New ${type.charAt(0).toUpperCase() + type.slice(1)} Release`, {
      body: `${title} is now available to watch!`,
      tag: `${type}-${title}`,
      requireInteraction: false,
    });
  };

  const notifyNewEpisode = (show: string, episode: string, season: number) => {
    if (!permission.granted) {
      requestPermission();
      return;
    }

    sendNotification(`📺 New Episode Available`, {
      body: `${show} - Season ${season}, Episode ${episode}`,
      tag: `tv-${show}-s${season}e${episode}`,
      requireInteraction: false,
    });
  };

  return {
    permission,
    requestPermission,
    notifyNewRelease,
    notifyNewEpisode,
  };
}
