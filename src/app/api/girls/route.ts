import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// データ保存先ファイルパス
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "girls.json");

// Girl型定義（APIレイヤー用）
interface Girl {
  id: string;
  name: string;
  tag: "レギュラー" | "レア" | "退店" | "ダミー";
  interviewed: boolean;
  lastInterviewDate: string | null;
  attendanceDates: string[];
  lastAttendance: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// ダミーキャスト一覧
const DUMMY_CASTS = [
  "まなみ", "パフェ", "あずさ", "なな", "うい", "いつき",
  "みかん", "ここね", "みず", "ふき", "かりな", "かのん"
];

// ダミーキャスト判定
function isDummyCast(name: string): boolean {
  return DUMMY_CASTS.includes(name);
}

// データ保存ディレクトリを確認・作成
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 保存済みデータを読み込む
function loadGirls(): Girl[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("データ読み込みエラー:", error);
  }
  return [];
}

// データを保存する
function saveGirls(girls: Girl[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(girls, null, 2), "utf-8");
  } catch (error) {
    console.error("データ保存エラー:", error);
    throw error;
  }
}

// タグを計算するユーティリティ関数
function calculateTag(attendanceDates: string[], name?: string): "レギュラー" | "レア" | "退店" | "ダミー" {
  // ダミーキャストの場合は常にダミータグを返す
  if (name && isDummyCast(name)) {
    return "ダミー";
  }

  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // 最終出勤日を取得
  const sortedDates = [...attendanceDates].sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );
  const lastAttendanceDate = sortedDates[0] ? new Date(sortedDates[0]) : null;

  // 2ヶ月以上出勤なし → 退店
  if (!lastAttendanceDate || lastAttendanceDate < twoMonthsAgo) {
    return "退店";
  }

  // 直近1ヶ月の出勤日数をカウント
  const recentAttendances = attendanceDates.filter(dateStr => {
    const date = new Date(dateStr);
    return date >= oneMonthAgo;
  });

  // 12日以上（週3換算）→ レギュラー
  if (recentAttendances.length >= 12) {
    return "レギュラー";
  }

  // 1-11日 → レア
  return "レア";
}

// GET: 全女の子データを取得
export async function GET() {
  const girls = loadGirls();
  return NextResponse.json({
    success: true,
    data: girls,
  });
}

// POST: 新規女の子を追加 または 出勤データから一括取り込み
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 出勤データからの一括取り込みの場合
    if (body.action === "import") {
      const { attendanceData, scrapedAt } = body;

      if (!attendanceData || !Array.isArray(attendanceData)) {
        return NextResponse.json(
          { success: false, message: "出勤データが不正です" },
          { status: 400 }
        );
      }

      const girls = loadGirls();
      const today = scrapedAt ? new Date(scrapedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      let addedCount = 0;
      let updatedCount = 0;

      for (const attendance of attendanceData) {
        const existingIndex = girls.findIndex(g => g.name === attendance.name);

        if (existingIndex >= 0) {
          // 既存の女の子を更新
          const girl = girls[existingIndex];
          if (!girl.attendanceDates.includes(today)) {
            girl.attendanceDates.push(today);
          }
          girl.lastAttendance = today;
          girl.tag = calculateTag(girl.attendanceDates, girl.name);
          girl.updatedAt = now;
          updatedCount++;
        } else {
          // 新規追加
          const isDummy = isDummyCast(attendance.name);
          const newGirl: Girl = {
            id: crypto.randomUUID(),
            name: attendance.name,
            tag: isDummy ? "ダミー" : "レア", // ダミーキャストは「ダミー」、初回は1日出勤なのでレア
            interviewed: false,
            lastInterviewDate: null,
            attendanceDates: [today],
            lastAttendance: today,
            note: "",
            createdAt: now,
            updatedAt: now,
          };
          girls.push(newGirl);
          addedCount++;
        }
      }

      // 全員のタグを再計算
      for (const girl of girls) {
        girl.tag = calculateTag(girl.attendanceDates, girl.name);
      }

      saveGirls(girls);

      return NextResponse.json({
        success: true,
        data: girls,
        message: `取り込み完了: ${addedCount}名追加, ${updatedCount}名更新`,
        addedCount,
        updatedCount,
      });
    }

    // 通常の新規追加
    const { name, note, interviewed, lastInterviewDate } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "名前は必須です" },
        { status: 400 }
      );
    }

    const girls = loadGirls();
    const now = new Date().toISOString();

    const newGirl: Girl = {
      id: crypto.randomUUID(),
      name,
      tag: "退店", // 出勤記録がないので退店扱い
      interviewed: interviewed || false,
      lastInterviewDate: lastInterviewDate || null,
      attendanceDates: [],
      lastAttendance: "",
      note: note || "",
      createdAt: now,
      updatedAt: now,
    };

    girls.push(newGirl);
    saveGirls(girls);

    return NextResponse.json({
      success: true,
      data: newGirl,
      message: "登録完了",
    });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, message: "エラーが発生しました" },
      { status: 500 }
    );
  }
}

// PUT: 女の子情報を更新
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, note, interviewed, lastInterviewDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "IDは必須です" },
        { status: 400 }
      );
    }

    const girls = loadGirls();
    const index = girls.findIndex(g => g.id === id);

    if (index < 0) {
      return NextResponse.json(
        { success: false, message: "女の子が見つかりません" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    girls[index] = {
      ...girls[index],
      name: name !== undefined ? name : girls[index].name,
      note: note !== undefined ? note : girls[index].note,
      interviewed: interviewed !== undefined ? interviewed : girls[index].interviewed,
      lastInterviewDate: lastInterviewDate !== undefined ? lastInterviewDate : girls[index].lastInterviewDate,
      updatedAt: now,
    };

    saveGirls(girls);

    return NextResponse.json({
      success: true,
      data: girls[index],
      message: "更新完了",
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, message: "エラーが発生しました" },
      { status: 500 }
    );
  }
}

// DELETE: 女の子を削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "IDは必須です" },
        { status: 400 }
      );
    }

    const girls = loadGirls();
    const index = girls.findIndex(g => g.id === id);

    if (index < 0) {
      return NextResponse.json(
        { success: false, message: "女の子が見つかりません" },
        { status: 404 }
      );
    }

    const deleted = girls.splice(index, 1)[0];
    saveGirls(girls);

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "削除完了",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
