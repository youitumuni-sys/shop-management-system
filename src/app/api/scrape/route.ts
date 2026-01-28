import { NextResponse } from "next/server";
import { checkPhotoDiaries, closeBrowser } from "@/lib/scraper/photo-diary-scraper";
import * as fs from "fs";
import * as path from "path";

// Vercel環境かどうかを検出
const IS_VERCEL = process.env.VERCEL === "1";

// データ保存先ファイルパス
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "scraping-result.json");

// スクレイピング実行中フラグ（メモリ内）
let isRunning = false;

// データ保存ディレクトリを確認・作成
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 保存済みデータを読み込む
function loadSavedData(): Awaited<ReturnType<typeof checkPhotoDiaries>> | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("データ読み込みエラー:", error);
  }
  return null;
}

// データを保存する
function saveData(data: Awaited<ReturnType<typeof checkPhotoDiaries>>) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("データ保存エラー:", error);
    throw error;
  }
}

export async function GET() {
  // 保存済みデータを返す
  const savedData = loadSavedData();

  if (savedData) {
    return NextResponse.json({
      success: true,
      data: savedData,
      message: "保存済みのスクレイピング結果",
    });
  }

  return NextResponse.json({
    success: true,
    data: null,
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

    const result = await checkPhotoDiaries();

    // 結果をファイルに保存
    saveData(result);

    return NextResponse.json({
      success: true,
      data: result,
      message: "スクレイピング完了・データ保存済み",
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "スクレイピングエラー",
      },
      { status: 500 }
    );
  } finally {
    isRunning = false;
    await closeBrowser();
  }
}
