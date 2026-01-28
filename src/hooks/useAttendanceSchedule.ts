"use client";

import { useState, useCallback, useEffect } from "react";

export interface AttendanceInfo {
  name: string;
  startTime: string;
  endTime: string;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD形式
  attendance: AttendanceInfo[];
}

export interface AttendanceScheduleData {
  scrapedAt: string;
  schedule: DailyAttendance[];
}

export function useAttendanceSchedule() {
  const [data, setData] = useState<AttendanceScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // 保存済みスケジュールを取得
  const fetchSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/attendance-schedule");
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

  // スケジュールをスクレイピングして更新
  const refreshSchedule = useCallback(async (days: number = 14) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/attendance-schedule?days=${days}`, {
        method: "POST",
      });
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

  // 特定日の出勤者数を取得
  const getAttendanceCountByDate = useCallback(
    (date: string): number | null => {
      if (!data?.schedule) return null;
      const dayData = data.schedule.find((d) => d.date === date);
      return dayData ? dayData.attendance.length : null;
    },
    [data]
  );

  // 特定日の出勤者リストを取得
  const getAttendanceByDate = useCallback(
    (date: string): AttendanceInfo[] | null => {
      if (!data?.schedule) return null;
      const dayData = data.schedule.find((d) => d.date === date);
      return dayData ? dayData.attendance : null;
    },
    [data]
  );

  // 日付ごとの出勤者数マップを生成
  const attendanceCountMap = useCallback((): Map<string, number> => {
    const map = new Map<string, number>();
    if (data?.schedule) {
      data.schedule.forEach((day) => {
        map.set(day.date, day.attendance.length);
      });
    }
    return map;
  }, [data]);

  // 初回読み込み
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    data,
    isLoading,
    error,
    lastFetched,
    fetchSchedule,
    refreshSchedule,
    getAttendanceCountByDate,
    getAttendanceByDate,
    attendanceCountMap,
  };
}
