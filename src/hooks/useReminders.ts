"use client";

import { useState, useEffect, useCallback } from "react";

export interface RemindersState {
  lastEventReview: string;
  lastPanelReview: string;
  reviewIntervalMonths: number;
  eventReviewDue: boolean;
  panelReviewDue: boolean;
}

export function useReminders() {
  const [reminders, setReminders] = useState<RemindersState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // リマインダー状態を取得
  const fetchReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/reminders");
      const result = await response.json();

      if (result.success) {
        setReminders(result.data);
      } else {
        setError(result.message || "リマインダー取得に失敗しました");
      }
    } catch (err) {
      setError("リマインダー取得中にエラーが発生しました");
      console.error("リマインダー取得エラー:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 確認日を更新
  const confirmReview = useCallback(
    async (type: "event" | "panel") => {
      try {
        const response = await fetch("/api/reminders", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type }),
        });

        const result = await response.json();

        if (result.success) {
          // データを再取得して状態を更新
          await fetchReminders();
          return true;
        } else {
          setError(result.message || "確認日の更新に失敗しました");
          return false;
        }
      } catch (err) {
        setError("確認日更新中にエラーが発生しました");
        console.error("確認日更新エラー:", err);
        return false;
      }
    },
    [fetchReminders]
  );

  // 月名を取得するヘルパー
  const getMonthName = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月`;
  }, []);

  // 初回読み込み
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    isLoading,
    error,
    fetchReminders,
    confirmReview,
    getMonthName,
  };
}
