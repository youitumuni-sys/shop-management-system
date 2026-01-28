import { NextResponse } from "next/server";
import {
  scrapeSparkScheduleRange,
  closeSparkScheduleBrowser,
  DailyAttendance,
} from "@/lib/scraper/spark-schedule-scraper";
import * as fs from "fs";
import * as path from "path";

// Vercel環境かどうかを検出
const IS_VERCEL = process.env.VERCEL === "1";

// ダミーキャスト一覧（出勤リストから除外）
const DUMMY_CASTS = [
  "まなみ", "パフェ", "あずさ", "なな", "うい", "いつき",
  "みかん", "ここね", "みず", "ふき", "かりな", "かのん"
];

// ダミーキャスト判定
function isDummyCast(name: string): boolean {
  return DUMMY_CASTS.includes(name);
}

// データ保存先ファイルパス
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "attendance-schedule.json");

// 出勤スケジュールデータの型
export interface AttendanceScheduleData {
  scrapedAt: string;
  schedule: DailyAttendance[];
}

// スクレイピング実行中フラグ（メモリ内）
let isRunning = false;

// データ保存ディレクトリを確認・作成
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 保存済みデータを読み込む
function loadSavedData(): AttendanceScheduleData | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("出勤スケジュールデータ読み込みエラー:", error);
  }
  return null;
}

// データを保存する
function saveData(data: AttendanceScheduleData) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("出勤スケジュールデータ保存エラー:", error);
    throw error;
  }
}

// ダミーキャストを除外する
function filterDummyCasts(schedule: DailyAttendance[]): DailyAttendance[] {
  return schedule.map((day) => ({
    ...day,
    attendance: day.attendance.filter((a) => !isDummyCast(a.name)),
  }));
}

/**
 * GET: 保存済みの出勤スケジュールを取得
 */
export async function GET() {
  const savedData = loadSavedData();

  if (savedData) {
    return NextResponse.json({
      success: true,
      data: savedData,
      message: "保存済みの出勤スケジュール",
    });
  }

  return NextResponse.json({
    success: true,
    data: null,
    message: "保存済みデータがありません",
  });
}

/**
 * POST: 未来の出勤スケジュールをスクレイピングして保存
 * クエリパラメータ:
 * - days: 取得する日数（デフォルト: 14日間）
 */
export async function POST(request: Request) {
  // Vercel環境ではスクレイピング不可
  if (IS_VERCEL) {
    return NextResponse.json(
      {
        success: false,
        message: "スクレイピング機能はサーバーレス環境では利用できません。ローカル環境で実行してください。",
        isVercel: true,
      },
      { status: 503 }
    );
  }

  if (isRunning) {
    return NextResponse.json(
      {
        success: false,
        message: "スクレイピングは既に実行中です",
      },
      { status: 429 }
    );
  }

  try {
    isRunning = true;

    // クエリパラメータから取得日数を取得
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "14", 10);
    const validDays = Math.min(Math.max(days, 1), 31); // 1〜31日間に制限

    // 今日の日付を取得
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];

    // 未来の出勤スケジュールを取得
    const rawSchedule = await scrapeSparkScheduleRange(startDate, validDays);

    // ダミーキャストを除外
    const schedule = filterDummyCasts(rawSchedule);

    const result: AttendanceScheduleData = {
      scrapedAt: new Date().toISOString(),
      schedule,
    };

    // 結果をファイルに保存
    saveData(result);

    return NextResponse.json({
      success: true,
      data: result,
      message: `${validDays}日分の出勤スケジュールを取得・保存しました`,
    });
  } catch (error) {
    console.error("出勤スケジュール取得エラー:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "スクレイピングエラー",
      },
      { status: 500 }
    );
  } finally {
    isRunning = false;
    await closeSparkScheduleBrowser();
  }
}
