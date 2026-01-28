"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

// モックユーザーデータ
const MOCK_USERS = [
  { id: "1", name: "管理者", email: "admin@example.com", password: "admin123", role: "admin" as const },
  { id: "2", name: "スタッフA", email: "staff@example.com", password: "staff123", role: "staff" as const },
];

const AUTH_STORAGE_KEY = "shop-management-auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初期化時にlocalStorageから認証状態を復元
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // ログイン
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      // モック認証（実際のSupabase連携時は置き換え）
      await new Promise((resolve) => setTimeout(resolve, 500)); // 擬似遅延

      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        };
        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        setIsLoading(false);
        router.push("/");
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "メールアドレスまたはパスワードが正しくありません" };
    },
    [router]
  );

  // ログアウト
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push("/login");
  }, [router]);

  // 認証チェック
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
