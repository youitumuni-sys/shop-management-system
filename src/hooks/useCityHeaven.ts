"use client";

import { useState, useCallback, useEffect } from "react";

export interface CityHeavenGirl {
  id: string;
  name: string;
  age?: number;
  height?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  accessCount?: number;
  diaryCount?: number;
}

export interface GirlAccessStats {
  name: string;
  dailyAccess: { [date: string]: number };
  monthlyTotal: number;
  lastMonthTotal: number;
  change: number;
}

export interface AccessStatsResult {
  year: number;
  month: number;
  girls: GirlAccessStats[];
  scrapedAt: string;
}

export interface GirlDiaryStats {
  name: string;
  dailyDiary: { [date: string]: number };
  monthlyTotal: number;
  lastMonthTotal: number;
  change: number;
}

export interface DiaryStatsResult {
  year: number;
  month: number;
  girls: GirlDiaryStats[];
  scrapedAt: string;
}

export interface CityHeavenStats {
  totalGirls: number;
  publishedCount: number;
  nonPublishedCount: number;
  totalAccess?: number;
  todayAccess?: number;
  scrapedAt: string;
}

export interface CityHeavenData {
  stats: CityHeavenStats;
  girls: CityHeavenGirl[];
  accessStats?: AccessStatsResult;
  diaryStats?: DiaryStatsResult;
}

export interface CityHeavenApiResponse {
  success: boolean;
  data: CityHeavenData | null;
  availableMonths?: string[];
  currentMonth?: string;
  message?: string;
}

// 写メ日記関連の型定義
export interface PhotoDiaryPost {
  name: string;
  title: string;
  postedAt: string;
  imageUrl?: string;
}

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

export interface PhotoDiaryData {
  scrapedAt: string;
  photoDiaries: PhotoDiaryPost[];
  checkResults: PhotoDiaryCheckResult[];
  unmatchedAuthors?: UnmatchedDiaryAuthor[];
}

export function useCityHeaven() {
  const [data, setData] = useState<CityHeavenData | null>(null);
  const [photoDiaryData, setPhotoDiaryData] = useState<PhotoDiaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // 写メ日記データを取得
  const fetchPhotoDiaries = useCallback(async () => {
    try {
      const res = await fetch("/api/scrape");
      const json = await res.json();

      if (json.success && json.data) {
        setPhotoDiaryData(json.data);
      }
    } catch (err) {
      console.error("写メ日記データ取得エラー:", err);
    }
  }, []);

  // 特定の月のデータを取得
  const fetchMonth = useCallback(async (month?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = month ? `/api/cityheaven?month=${month}` : "/api/cityheaven";
      const [cityheavenRes] = await Promise.all([
        fetch(url),
        fetchPhotoDiaries(),
      ]);

      const json: CityHeavenApiResponse = await cityheavenRes.json();

      if (json.success) {
        setData(json.data);
        if (json.availableMonths) {
          setAvailableMonths(json.availableMonths);
        }
        if (json.currentMonth) {
          setSelectedMonth(json.currentMonth);
        }
        setLastFetched(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得エラー");
    } finally {
      setIsLoading(false);
    }
  }, [fetchPhotoDiaries]);

  // 最新結果を取得
  const fetchLatest = useCallback(async () => {
    await fetchMonth();
  }, [fetchMonth]);

  // 月を切り替え
  const changeMonth = useCallback(async (month: string) => {
    setSelectedMonth(month);
    await fetchMonth(month);
  }, [fetchMonth]);

  // スクレイピング実行
  const runScraping = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/cityheaven", { method: "POST" });
      const json: CityHeavenApiResponse & { currentMonth?: string } = await res.json();

      if (json.success && json.data) {
        setData(json.data);
        if (json.availableMonths) {
          setAvailableMonths(json.availableMonths);
        }
        if (json.currentMonth) {
          setSelectedMonth(json.currentMonth);
        }
        setLastFetched(new Date());
        // 写メ日記データも再取得
        await fetchPhotoDiaries();
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
  }, [fetchPhotoDiaries]);

  // 初回読み込み
  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  // 女の子ごとの本日日記投稿数をマップで返す
  const todayDiaryCountMap = useCallback((): Map<string, number> => {
    const countMap = new Map<string, number>();

    if (!photoDiaryData?.photoDiaries) {
      return countMap;
    }

    // 本日の日付を取得（日本時間）
    const now = new Date();
    const jstOffset = 9 * 60; // JST is UTC+9
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    const todayMonth = jstTime.getUTCMonth() + 1;
    const todayDay = jstTime.getUTCDate();
    const todayStr = `${todayMonth}/${todayDay}`;

    // 本日の投稿をカウント
    photoDiaryData.photoDiaries.forEach((post) => {
      if (post.postedAt.startsWith(todayStr)) {
        const currentCount = countMap.get(post.name) || 0;
        countMap.set(post.name, currentCount + 1);
      }
    });

    return countMap;
  }, [photoDiaryData]);

  return {
    data,
    girls: data?.girls || [],
    stats: data?.stats || null,
    accessStats: data?.accessStats || null,
    diaryStats: data?.diaryStats || null,
    photoDiaryData,
    todayDiaryCountMap,
    isLoading,
    error,
    lastFetched,
    availableMonths,
    selectedMonth,
    fetchLatest,
    changeMonth,
    runScraping,
  };
}
