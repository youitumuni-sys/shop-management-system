/**
 * 写メ日記スクレイピングスケジューラ
 * 9時から3時間ごと（9:00, 12:00, 15:00, 18:00, 21:00, 0:00）に実行
 */

import cron from "node-cron";
import { checkPhotoDiaries, closeBrowser, ScrapingResult } from "./photo-diary-scraper";

// スケジュール設定: 毎日 9,12,15,18,21,0 時に実行
const SCHEDULE = "0 9,12,15,18,21,0 * * *";

let lastResult: ScrapingResult | null = null;
let isSchedulerRunning = false;

export function getLastResult(): ScrapingResult | null {
  return lastResult;
}

export async function runScrapingJob(): Promise<ScrapingResult | null> {
  console.log(`[${new Date().toISOString()}] スクレイピング開始...`);

  try {
    const result = await checkPhotoDiaries();
    lastResult = result;

    console.log(`[${new Date().toISOString()}] スクレイピング完了`);
    console.log(`  - 出勤者数: ${result.attendance.length}`);
    console.log(`  - 完了: ${result.checkResults.filter((r) => r.status === "complete").length}`);
    console.log(`  - 部分完了: ${result.checkResults.filter((r) => r.status === "partial").length}`);
    console.log(`  - 未投稿: ${result.checkResults.filter((r) => r.status === "none").length}`);

    return result;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] スクレイピングエラー:`, error);
    return null;
  } finally {
    await closeBrowser();
  }
}

export function startScheduler(): void {
  if (isSchedulerRunning) {
    console.log("スケジューラは既に稼働中です");
    return;
  }

  console.log(`スケジューラ開始: ${SCHEDULE}`);
  console.log("実行時刻: 9:00, 12:00, 15:00, 18:00, 21:00, 0:00");

  cron.schedule(SCHEDULE, async () => {
    await runScrapingJob();
  });

  isSchedulerRunning = true;
}

export function stopScheduler(): void {
  // node-cronは明示的なstop機能がないため、プロセス終了で停止
  isSchedulerRunning = false;
  console.log("スケジューラ停止");
}

// 次回実行時刻を取得
export function getNextRunTime(): Date {
  const now = new Date();
  const hours = [0, 9, 12, 15, 18, 21];
  const currentHour = now.getHours();

  for (const hour of hours) {
    if (hour > currentHour) {
      const next = new Date(now);
      next.setHours(hour, 0, 0, 0);
      return next;
    }
  }

  // 翌日の9時
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(9, 0, 0, 0);
  return next;
}
