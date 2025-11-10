import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { showInstallPrompt, isStandalone } from '@/utils/pwaInstaller';

export default function PWAInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      return;
    }

    const handleInstallable = (event: Event) => {
      const customEvent = event as CustomEvent<{ canInstall: boolean }>;
      setCanInstall(customEvent.detail.canInstall);
    };

    window.addEventListener('pwa-installable', handleInstallable);

    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (!accepted) {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!canInstall || dismissed || isStandalone()) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Download" size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Установить приложение
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Установите приложение на компьютер для быстрого доступа и работы офлайн
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                Установить
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Позже
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
