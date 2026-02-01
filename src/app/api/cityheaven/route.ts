import { NextRequest, NextResponse } from "next/server";
import {
  scrapeGirlsInfoWithStats,
  closeCityHeavenBrowser,
  CityHeavenResult,
  GirlAccessStatsResult,
  GirlDiaryStatsResult,
} from "@/lib/scraper/cityheaven-scraper";
import * as fs from "fs";
import * as path from "path";

// Vercel環境かどうかを検出
const IS_VERCEL = process.env.VERCEL === "1";

// 結合されたデータ型
export type CityHeavenResultWithStats = CityHeavenResult & {
  accessStats: GirlAccessStatsResult;
  diaryStats: GirlDiaryStatsResult;
};

// 月別データの型
export interface MonthlyData {
  [yearMonth: string]: CityHeavenResultWithStats;
}

// データ保存先ファイルパス
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "cityheaven-monthly.json");

// スクレイピング実行中フラグ（メモリ内）
let isRunning = false;

// データ保存ディレクトリを確認・作成
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 月別データを読み込む
function loadMonthlyData(): MonthlyData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("データ読み込みエラー:", error);
  }
  return {};
}

// 月別データを保存する
function saveMonthlyData(data: MonthlyData) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("データ保存エラー:", error);
    throw error;
  }
}

// 利用可能な月のリストを取得
function getAvailableMonths(data: MonthlyData): string[] {
  return Object.keys(data).sort().reverse();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearMonth = searchParams.get("month"); // "2026-01" 形式

  const monthlyData = loadMonthlyData();
  const availableMonths = getAvailableMonths(monthlyData);

  if (yearMonth) {
    // 特定の月のデータを返す
    const data = monthlyData[yearMonth];
    if (data) {
      return NextResponse.json({
        success: true,
        data,
        availableMonths,
        message: `${yearMonth}のデータ`,
      });
    }
    return NextResponse.json({
      success: true,
      data: null,
      availableMonths,
      message: `${yearMonth}のデータがありません`,
    });
  }

  // 月指定がない場合は最新のデータを返す
  if (availableMonths.length > 0) {
    const latestMonth = availableMonths[0];
    return NextResponse.json({
      success: true,
      data: monthlyData[latestMonth],
      availableMonths,
      currentMonth: latestMonth,
      message: "最新のシティヘブンデータ",
    });
  }

  return NextResponse.json({
    success: true,
    data: null,
    availableMonths: [],
    message: "保存済みデータがありません",
  });
}

export async function POST() {
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

    const result = await scrapeGirlsInfoWithStats();

    // 年月キーを生成（accessStatsから取得）
    const year = result.accessStats.year;
    const month = String(result.accessStats.month).padStart(2, "0");
    const yearMonth = `${year}-${month}`;

    // 月別データに保存
    const monthlyData = loadMonthlyData();
    monthlyData[yearMonth] = result;
    saveMonthlyData(monthlyData);

    const availableMonths = getAvailableMonths(monthlyData);

    return NextResponse.json({
      success: true,
      data: result,
      availableMonths,
      currentMonth: yearMonth,
      message: "シティヘブンデータ取得完了・データ保存済み",
    });
  } catch (error) {
    console.error("CityHeaven scraping error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "スクレイピングエラー",
      },
      { status: 500 }
    );
  } finally {
    isRunning = false;
    await closeCityHeavenBrowser();
  }
}
