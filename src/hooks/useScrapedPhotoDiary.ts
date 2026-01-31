"use client";

import { useState, useCallback, useEffect } from "react";

export interface PhotoDiaryCheckResult {
  name: string;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  postCount: number;
  posts: { title: string; time: string }[];
  status: "complete" | "partial" | "none";
}

export interface UnmatchedDiaryAuthor {
  name: string;
  postCount: number;
  posts: { title: string; time: string }[];
}

export interface PhotoDiaryPost {
  name: string;
  title: string;
  postedAt: string;
  imageUrl?: string;
}

export interface AttendanceInfo {
  name: string;
  startTime: string;
  endTime: string;
}

export interface ScrapingData {
  scrapedAt: string;
  targetDate?: string; // YYYY-MM-DD形式（対象日付）
  attendance?: AttendanceInfo[];
  checkResults: PhotoDiaryCheckResult[];
  unmatchedAuthors?: UnmatchedDiaryAuthor[];
  photoDiaries?: PhotoDiaryPost[];
}

export function useScrapedPhotoDiary() {
  const [data, setData] = useState<ScrapingData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 初回ロード中は true
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // 最新結果を取得
  const fetchLatest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/scrape");
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
        setLastFetched(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得エラー");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // スクレイピング実行
  const runScraping = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/scrape", { method: "POST" });
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
        setLastFetched(new Date());
        return { success: true };
      } else {
        setError(json.message || "スクレイピング失敗");
        return { success: false, error: json.message };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "実行エラー";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 統計計算
  const TARGET_POSTS = 100; // 目標取得件数
  const stats = data
    ? {
        total: data.checkResults.length,
        complete: data.checkResults.filter((r) => r.status === "complete").length,
        partial: data.checkResults.filter((r) => r.status === "partial").length,
        none: data.checkResults.filter((r) => r.status === "none").length,
        percentage:
          data.checkResults.length > 0
            ? Math.round(
                (data.checkResults.filter((r) => r.status === "complete").length /
                  data.checkResults.length) *
                  100
              )
            : 0,
        // 本日の投稿数関連
        todayPostCount: data.photoDiaries?.length ?? 0,
        targetPostCount: TARGET_POSTS,
        isTargetAchieved: (data.photoDiaries?.length ?? 0) >= TARGET_POSTS,
        targetAchievementRate: Math.round(((data.photoDiaries?.length ?? 0) / TARGET_POSTS) * 100),
      }
    : null;

  // 初回読み込み
  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  return {
    data,
    stats,
    isLoading,
    error,
    lastFetched,
    fetchLatest,
    runScraping,
  };
}
