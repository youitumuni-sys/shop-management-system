"use client";

import { useState, useEffect, useCallback } from "react";

// 目標設定の型定義
export interface AttendanceTargets {
  weekdayTarget: number;
  weekendTarget: number;
  eventTarget: number;
  nightTarget: number;
}

// デフォルト値
const DEFAULT_TARGETS: AttendanceTargets = {
  weekdayTarget: 25,
  weekendTarget: 35,
  eventTarget: 50,
  nightTarget: 10,
};

// 日本の祝日（簡易版 - 2026年）
const JAPANESE_HOLIDAYS_2026 = [
  "2026-01-01", // 元日
  "2026-01-12", // 成人の日
  "2026-02-11", // 建国記念の日
  "2026-02-23", // 天皇誕生日
  "2026-03-20", // 春分の日
  "2026-04-29", // 昭和の日
  "2026-05-03", // 憲法記念日
  "2026-05-04", // みどりの日
  "2026-05-05", // こどもの日
  "2026-05-06", // 振替休日
  "2026-07-20", // 海の日
  "2026-08-11", // 山の日
  "2026-09-21", // 敬老の日
  "2026-09-22", // 秋分の日
  "2026-09-23", // 国民の休日
  "2026-10-12", // スポーツの日
  "2026-11-03", // 文化の日
  "2026-11-23", // 勤労感謝の日
];

export type DayType = "weekday" | "weekend" | "event";

// イベント日かどうか判定（末尾2と8の日: 2,12,22日および8,18,28日）
export function isEventDay(date: Date): boolean {
  const day = date.getDate();
  return day % 10 === 2 || day % 10 === 8;
}

// 夜間勤務者かどうか判定（endTimeが24時以降＝0〜5時）
export function isNightShift(endTime?: string): boolean {
  if (!endTime) return false;

  // 時間部分を取得（HH:MM形式）
  const [hourStr] = endTime.split(":");
  const hour = parseInt(hourStr, 10);

  // 24時以降（0〜5時）を夜間とする
  return hour >= 0 && hour <= 5;
}

export function useAttendanceTargets() {
  const [targets, setTargets] = useState<AttendanceTargets>(DEFAULT_TARGETS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 目標設定を取得
  const fetchTargets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/attendance-targets");
      const result = await response.json();

      if (result.success && result.data) {
        setTargets(result.data);
      }
    } catch (err) {
      console.error("目標設定取得エラー:", err);
      setError("目標設定の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 目標設定を更新
  const updateTargets = useCallback(async (newTargets: AttendanceTargets) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/attendance-targets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTargets),
      });
      const result = await response.json();

      if (result.success && result.data) {
        setTargets(result.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("目標設定更新エラー:", err);
      setError("目標設定の更新に失敗しました");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 祝日かどうかチェック
  const isHoliday = useCallback((dateStr: string): boolean => {
    return JAPANESE_HOLIDAYS_2026.includes(dateStr);
  }, []);

  // 週末（土日）かどうかチェック
  const isWeekend = useCallback((date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0: 日曜, 6: 土曜
  }, []);

  // 日付の種類を判定（イベント日を外部から渡す、または末尾2/8の日）
  const getDayType = useCallback(
    (date: Date, hasEvent: boolean): DayType => {
      // 外部イベント、または末尾2/8の日はイベント日
      if (hasEvent || isEventDay(date)) return "event";

      const dateStr = date.toISOString().split("T")[0];
      if (isWeekend(date) || isHoliday(dateStr)) return "weekend";

      return "weekday";
    },
    [isWeekend, isHoliday]
  );

  // 日付の種類に応じた目標を取得
  const getTargetForDayType = useCallback(
    (dayType: DayType): number => {
      switch (dayType) {
        case "event":
          return targets.eventTarget;
        case "weekend":
          return targets.weekendTarget;
        case "weekday":
        default:
          return targets.weekdayTarget;
      }
    },
    [targets]
  );

  // 日付の種類の日本語ラベル
  const getDayTypeLabel = useCallback((dayType: DayType): string => {
    switch (dayType) {
      case "event":
        return "イベント日";
      case "weekend":
        return "土日祝";
      case "weekday":
      default:
        return "平日";
    }
  }, []);

  // 達成率を計算
  const calculateAchievementRate = useCallback(
    (current: number, target: number): number => {
      if (target <= 0) return 0;
      return Math.round((current / target) * 100);
    },
    []
  );

  // 達成率に応じた色を取得
  const getAchievementColor = useCallback((rate: number): string => {
    if (rate >= 100) return "text-green-500";
    if (rate >= 80) return "text-yellow-500";
    return "text-red-500";
  }, []);

  // 達成率に応じたプログレスバー色を取得
  const getProgressColor = useCallback((rate: number): string => {
    if (rate >= 100) return "bg-green-500";
    if (rate >= 80) return "bg-yellow-500";
    return "bg-red-500";
  }, []);

  // 初回ロード
  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  return {
    targets,
    isLoading,
    error,
    fetchTargets,
    updateTargets,
    isHoliday,
    isWeekend,
    getDayType,
    getTargetForDayType,
    getDayTypeLabel,
    calculateAchievementRate,
    getAchievementColor,
    getProgressColor,
  };
}
