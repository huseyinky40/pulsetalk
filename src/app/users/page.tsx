"use client";

import { useEffect, useState } from "react";
import type { StoredUser } from "@/lib/userStore";
import { getAllUsers } from "@/lib/userStore";

function formatDate(d?: string | number | Date) {
  if (!d) return "-";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(d));
  } catch {
    return "-";
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllUsers();
        console.log("IndexedDB'deki kullanıcılar:", all);
        setUsers(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Kayıtlı Kullanıcılar</h1>
        <p className="mt-2 opacity-70">Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">📋 Kayıtlı Kullanıcılar</h1>

      {users.length === 0 ? (
        <p className="mt-3 opacity-70">Henüz kayıtlı kullanıcı yok.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[640px] border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-zinc-800">
              <tr>
                <th className="text-left p-3 border-b border-gray-200 dark:border-zinc-700">Kullanıcı Adı</th>
                <th className="text-left p-3 border-b border-gray-200 dark:border-zinc-700">E-posta</th>
                <th className="text-left p-3 border-b border-gray-200 dark:border-zinc-700">Doğum Tarihi</th>
                <th className="text-left p-3 border-b border-gray-200 dark:border-zinc-700">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.username}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-950"
                >
                  <td className="p-3 border-b border-gray-200 dark:border-zinc-800">{u.username}</td>
                  <td className="p-3 border-b border-gray-200 dark:border-zinc-800">{u.email}</td>
                  <td className="p-3 border-b border-gray-200 dark:border-zinc-800">{u.birth ?? "-"}</td>
                  <td className="p-3 border-b border-gray-200 dark:border-zinc-800">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
