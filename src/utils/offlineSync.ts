interface SyncQueueItem {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

class OfflineSync {
  private dbName = 'ContractsDB';
  private version = 1;
  private storeName = 'syncQueue';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async addToQueue(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: string
  ): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const item: SyncQueueItem = {
      id: `${Date.now()}-${Math.random()}`,
      url,
      method,
      headers,
      body,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => {
        this.registerSync();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getQueue(): Promise<SyncQueueItem[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromQueue(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearQueue(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async registerSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-contracts');
      } catch (error) {
        console.log('Background sync not available, will sync on next connection');
        this.syncNow();
      }
    } else {
      this.syncNow();
    }
  }

  async syncNow(): Promise<void> {
    if (!navigator.onLine) {
      return;
    }

    const queue = await this.getQueue();

    for (const item of queue) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });
        await this.removeFromQueue(item.id);
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }
  }

  getQueueLength(): Promise<number> {
    return this.getQueue().then(queue => queue.length);
  }
}

export const offlineSync = new OfflineSync();

window.addEventListener('online', () => {
  offlineSync.syncNow();
});
