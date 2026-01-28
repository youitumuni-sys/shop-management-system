import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// データ保存先ファイルパス
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "attendance-targets.json");

// 目標設定の型定義
interface AttendanceTargets {
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

// データ保存ディレクトリを確認・作成
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 保存済みデータを読み込む
function loadTargets(): AttendanceTargets {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("目標設定データ読み込みエラー:", error);
  }
  return DEFAULT_TARGETS;
}

// データを保存する
function saveTargets(data: AttendanceTargets) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("目標設定データ保存エラー:", error);
    throw error;
  }
}

// GET: 目標設定を取得
export async function GET() {
  try {
    const targets = loadTargets();
    return NextResponse.json({
      success: true,
      data: targets,
    });
  } catch (error) {
    console.error("目標設定取得エラー:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "目標設定取得エラー",
      },
      { status: 500 }
    );
  }
}

// PUT: 目標設定を更新
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // バリデーション
    const targets: AttendanceTargets = {
      weekdayTarget: typeof body.weekdayTarget === "number" && body.weekdayTarget >= 0
        ? body.weekdayTarget
        : DEFAULT_TARGETS.weekdayTarget,
      weekendTarget: typeof body.weekendTarget === "number" && body.weekendTarget >= 0
        ? body.weekendTarget
        : DEFAULT_TARGETS.weekendTarget,
      eventTarget: typeof body.eventTarget === "number" && body.eventTarget >= 0
        ? body.eventTarget
        : DEFAULT_TARGETS.eventTarget,
      nightTarget: typeof body.nightTarget === "number" && body.nightTarget >= 0
        ? body.nightTarget
        : DEFAULT_TARGETS.nightTarget,
    };

    saveTargets(targets);

    return NextResponse.json({
      success: true,
      data: targets,
      message: "目標設定を保存しました",
    });
  } catch (error) {
    console.error("目標設定保存エラー:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "目標設定保存エラー",
      },
      { status: 500 }
    );
  }
}
