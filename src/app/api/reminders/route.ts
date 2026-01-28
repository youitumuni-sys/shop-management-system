import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// リマインダーデータの型定義
export interface RemindersData {
  lastEventReview: string;
  lastPanelReview: string;
  reviewIntervalMonths: number;
}

// データファイルパス
const DATA_FILE = path.join(process.cwd(), "data", "reminders.json");

// デフォルトデータ
const DEFAULT_DATA: RemindersData = {
  lastEventReview: new Date().toISOString().split("T")[0],
  lastPanelReview: new Date().toISOString().split("T")[0],
  reviewIntervalMonths: 3,
};

// データを読み込む
function loadReminders(): RemindersData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("リマインダーデータ読み込みエラー:", error);
  }
  return DEFAULT_DATA;
}

// データを保存する
function saveReminders(data: RemindersData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("リマインダーデータ保存エラー:", error);
    throw error;
  }
}

// 期限切れかどうか判定（3, 6, 9, 12月にチェック）
function isReviewDue(lastReviewDate: string): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // 見直し対象月: 3, 6, 9, 12月
  const reviewMonths = [3, 6, 9, 12];

  // 現在が見直し対象月かチェック
  if (!reviewMonths.includes(currentMonth)) {
    return false;
  }

  // 前回の見直し日
  const lastReview = new Date(lastReviewDate);
  const lastReviewMonth = lastReview.getMonth() + 1;
  const lastReviewYear = lastReview.getFullYear();

  // 今年の現在の見直し月で見直し済みかチェック
  if (lastReviewYear === currentYear && lastReviewMonth === currentMonth) {
    return false;
  }

  // 前回の見直しが今年の現在月より前、または昨年以前なら見直しが必要
  if (lastReviewYear < currentYear) {
    return true;
  }

  if (lastReviewYear === currentYear && lastReviewMonth < currentMonth) {
    return true;
  }

  return false;
}

// GET: リマインダー状態取得
export async function GET() {
  const data = loadReminders();

  const eventReviewDue = isReviewDue(data.lastEventReview);
  const panelReviewDue = isReviewDue(data.lastPanelReview);

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      eventReviewDue,
      panelReviewDue,
    },
  });
}

// PUT: 確認日更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type || !["event", "panel"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "タイプは 'event' または 'panel' である必要があります" },
        { status: 400 }
      );
    }

    const data = loadReminders();
    const today = new Date().toISOString().split("T")[0];

    if (type === "event") {
      data.lastEventReview = today;
    } else if (type === "panel") {
      data.lastPanelReview = today;
    }

    saveReminders(data);

    return NextResponse.json({
      success: true,
      data,
      message: `${type === "event" ? "イベント" : "パネル"}の見直しを確認しました`,
    });
  } catch (error) {
    console.error("リマインダー更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "リマインダー更新に失敗しました" },
      { status: 500 }
    );
  }
}
