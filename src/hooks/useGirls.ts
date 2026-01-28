"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Girl,
  GirlTagType,
  needsInterview,
} from "@/components/features/girls";

export interface CreateGirlInput {
  name: string;
  note?: string;
  interviewed?: boolean;
  lastInterviewDate?: string | null;
}

export interface UpdateGirlInput {
  name?: string;
  note?: string;
  interviewed?: boolean;
  lastInterviewDate?: string | null;
}

export function useGirls() {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データを取得
  const fetchGirls = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/girls");
      const data = await res.json();
      if (data.success) {
        setGirls(data.data);
      } else {
        setError(data.message || "データの取得に失敗しました");
      }
    } catch {
      setError("データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGirls();
  }, [fetchGirls]);

  // Create - 新規追加
  const createGirl = useCallback(async (input: CreateGirlInput): Promise<Girl | null> => {
    try {
      const res = await fetch("/api/girls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setGirls((prev) => [...prev, data.data]);
        return data.data;
      }
      setError(data.message || "登録に失敗しました");
      return null;
    } catch {
      setError("登録に失敗しました");
      return null;
    }
  }, []);

  // Read - 全件取得（フィルタリング対応）
  const getGirls = useCallback(
    (tagFilter?: GirlTagType): Girl[] => {
      if (!tagFilter) return girls;
      return girls.filter((girl) => girl.tag === tagFilter);
    },
    [girls]
  );

  // Read - 1件取得
  const getGirlById = useCallback(
    (id: string): Girl | undefined => {
      return girls.find((girl) => girl.id === id);
    },
    [girls]
  );

  // Update - 更新
  const updateGirl = useCallback(
    async (id: string, input: UpdateGirlInput): Promise<Girl | null> => {
      try {
        const res = await fetch("/api/girls", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...input }),
        });
        const data = await res.json();
        if (data.success) {
          setGirls((prev) =>
            prev.map((girl) => (girl.id === id ? data.data : girl))
          );
          return data.data;
        }
        setError(data.message || "更新に失敗しました");
        return null;
      } catch {
        setError("更新に失敗しました");
        return null;
      }
    },
    []
  );

  // Update - 面談状況更新
  const updateInterviewStatus = useCallback(
    async (id: string, interviewed: boolean, lastInterviewDate?: string): Promise<Girl | null> => {
      return updateGirl(id, {
        interviewed,
        lastInterviewDate: lastInterviewDate || (interviewed ? new Date().toISOString().split("T")[0] : null),
      });
    },
    [updateGirl]
  );

  // Update - 備考更新
  const updateGirlNote = useCallback(
    async (id: string, note: string): Promise<Girl | null> => {
      return updateGirl(id, { note });
    },
    [updateGirl]
  );

  // Delete - 削除
  const deleteGirl = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/girls?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setGirls((prev) => prev.filter((girl) => girl.id !== id));
        return true;
      }
      setError(data.message || "削除に失敗しました");
      return false;
    } catch {
      setError("削除に失敗しました");
      return false;
    }
  }, []);

  // 出勤データから取り込み
  const importFromAttendance = useCallback(async (): Promise<{ addedCount: number; updatedCount: number } | null> => {
    try {
      // まず保存済みの出勤データを取得
      const scrapeRes = await fetch("/api/scrape");
      const scrapeData = await scrapeRes.json();

      if (!scrapeData.success || !scrapeData.data) {
        setError("出勤データがありません");
        return null;
      }

      const { attendance, scrapedAt } = scrapeData.data;

      if (!attendance || attendance.length === 0) {
        setError("出勤データが空です");
        return null;
      }

      // 女の子マスタにインポート
      const importRes = await fetch("/api/girls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          attendanceData: attendance,
          scrapedAt,
        }),
      });

      const importResult = await importRes.json();

      if (importResult.success) {
        setGirls(importResult.data);
        return {
          addedCount: importResult.addedCount,
          updatedCount: importResult.updatedCount,
        };
      }
      setError(importResult.message || "取り込みに失敗しました");
      return null;
    } catch {
      setError("取り込みに失敗しました");
      return null;
    }
  }, []);

  // 統計情報
  const getStats = useCallback(() => {
    const total = girls.length;
    const byTag = girls.reduce(
      (acc, girl) => {
        acc[girl.tag] = (acc[girl.tag] || 0) + 1;
        return acc;
      },
      {} as Record<GirlTagType, number>
    );
    const needsInterviewCount = girls.filter((girl) =>
      needsInterview(girl.lastInterviewDate)
    ).length;

    return { total, byTag, needsInterviewCount };
  }, [girls]);

  return {
    girls,
    isLoading,
    error,
    fetchGirls,
    createGirl,
    getGirls,
    getGirlById,
    updateGirl,
    updateInterviewStatus,
    updateGirlNote,
    deleteGirl,
    importFromAttendance,
    getStats,
  };
}
