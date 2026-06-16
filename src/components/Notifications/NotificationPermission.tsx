import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationPermissionProps {
  onClose?: () => void;
}

export default function NotificationPermission({ onClose }: NotificationPermissionProps) {
  const { permission, requestPermission } = useNotifications();
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    const granted = await requestPermission();
    setLoading(false);
    if (granted && onClose) {
      onClose();
    }
  };

  if (permission.granted || !permission.canRequest) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <div className="glass rounded-lg p-4 shadow-2xl border border-primary/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Enable Notifications</h3>
            <p className="text-sm text-gray-300 mb-3">
              Get notified about live sports matches, new releases, and your favorite shows.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Enable'
                )}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Later
                </button>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
