// src/lib/userStore.ts

export type StoredUser = {
  username: string;
  email: string;
  password?: string;   // sadece create sırasında gönderilir
  birth: string;       // ISO tarih (ör: "2000-02-02")
  createdAt?: string;
};

const base = '/api/users';

// Yeni kullanıcı ekleme
export async function addUser(u: StoredUser): Promise<void> {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(u),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Kullanıcı oluşturulamadı');
  }
}

// Tüm kullanıcıları çek
export async function getAllUsers(): Promise<StoredUser[]> {
  const res = await fetch(base, { cache: 'no-store' });
  if (!res.ok) throw new Error('Kullanıcı listesi alınamadı');

  const list = await res.json();
  return list.map((x: any) => ({
    username: x.username,
    email: x.email,
    birth: new Date(x.birth).toISOString(),
    createdAt: new Date(x.createdAt).toISOString(),
  }));
}

// Kullanıcıyı kullanıcı adına göre getir
export async function getUserByUsername(username: string): Promise<StoredUser | null> {
  const res = await fetch(`${base}?username=${encodeURIComponent(username)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Kullanıcı alınamadı');
  const x = await res.json();
  if (!x) return null;

  return {
    username: x.username,
    email: x.email,
    birth: new Date(x.birth).toISOString(),
    createdAt: new Date(x.createdAt).toISOString(),
  };
}

// Kullanıcıyı e-posta adresine göre getir
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const res = await fetch(`${base}?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Kullanıcı alınamadı');
  const x = await res.json();
  if (!x) return null;

  return {
    username: x.username,
    email: x.email,
    birth: new Date(x.birth).toISOString(),
    createdAt: new Date(x.createdAt).toISOString(),
  };
}
