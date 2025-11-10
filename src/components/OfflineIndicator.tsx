import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { offlineSync } from '@/utils/offlineSync';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        offlineSync.syncNow();
      }
    };

    const updatePendingCount = async () => {
      const count = await offlineSync.getQueueLength();
      setPendingCount(count);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const interval = setInterval(updatePendingCount, 2000);
    updatePendingCount();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
          isOnline
            ? 'bg-blue-500 text-white'
            : 'bg-orange-500 text-white'
        }`}
      >
        <Icon
          name={isOnline ? 'RefreshCw' : 'WifiOff'}
          size={16}
          className={isOnline ? 'animate-spin' : ''}
        />
        <span className="text-sm font-medium">
          {isOnline
            ? pendingCount > 0
              ? `Синхронизация (${pendingCount})`
              : 'Онлайн'
            : 'Офлайн режим'}
        </span>
      </div>
    </div>
  );
}
