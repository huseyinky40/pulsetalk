export type StoredUser = {
  username: string;
  email: string;
  password: string;
  birth: string;
  createdAt: string;
};

const DB_NAME = 'pulsetalk-auth';
const DB_VERSION = 1;
const STORE_NAME = 'users';

const isClient = () => typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const openDB = (): Promise<IDBDatabase | null> => {
  if (!isClient()) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB açılırken hata oluştu'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'username' });
        store.createIndex('email', 'email', { unique: true });
      }
    };
  });
};

const closeWhenDone = (db: IDBDatabase, tx: IDBTransaction) => {
  tx.oncomplete = () => {
    db.close();
  };
  tx.onabort = () => {
    db.close();
  };
  tx.onerror = () => {
    db.close();
  };
};

export async function addUser(user: Omit<StoredUser, 'createdAt'> & { createdAt?: string }): Promise<void> {
  const db = await openDB();
  if (!db) return;

  const record: StoredUser = {
    ...user,
    createdAt: user.createdAt ?? new Date().toISOString(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    closeWhenDone(db, tx);
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Kullanıcı ekleme hatası'));
  });
}

export async function getUserByUsername(username: string): Promise<StoredUser | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    closeWhenDone(db, tx);
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(username);
    request.onsuccess = () => {
      resolve((request.result as StoredUser | undefined) ?? null);
    };
    request.onerror = () => reject(request.error ?? new Error('Kullanıcı alınamadı'));
  });
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    closeWhenDone(db, tx);
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('email');
    const request = index.get(email);
    request.onsuccess = () => {
      resolve((request.result as StoredUser | undefined) ?? null);
    };
    request.onerror = () => reject(request.error ?? new Error('E-posta aranamadı'));
  });
}

export async function getAllUsers(): Promise<StoredUser[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    closeWhenDone(db, tx);
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      resolve((request.result as StoredUser[]) ?? []);
    };
    request.onerror = () => reject(request.error ?? new Error('Kullanıcı listesi alınamadı'));
  });
}
