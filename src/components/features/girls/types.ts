// 女の子マスタの型定義

// タグの定義
export const GirlTag = {
  REGULAR: "レギュラー",
  RARE: "レア",
  RETIRED: "退店",
  DUMMY: "ダミー",
} as const;

export type GirlTagType = (typeof GirlTag)[keyof typeof GirlTag];

// ダミーキャスト一覧
export const DUMMY_CASTS = [
  "まなみ", "パフェ", "あずさ", "なな", "うい", "いつき",
  "みかん", "ここね", "みず", "ふき", "かりな", "かのん"
] as const;

// ダミーキャスト判定
export function isDummyCast(name: string): boolean {
  return DUMMY_CASTS.includes(name as typeof DUMMY_CASTS[number]);
}

export interface Girl {
  id: string;
  name: string;
  tag: GirlTagType;
  interviewed: boolean;
  lastInterviewDate: string | null;
  attendanceDates: string[]; // 出勤日の配列（YYYY-MM-DD形式）
  lastAttendance: string; // 最終出勤日（YYYY-MM-DD形式）
  note: string;
  createdAt: string;
  updatedAt: string;
}

export type GirlFormData = Pick<Girl, "name" | "note" | "interviewed" | "lastInterviewDate">;

// タグ計算のためのユーティリティ関数
export function calculateTag(attendanceDates: string[]): GirlTagType {
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
    return GirlTag.RETIRED;
  }

  // 直近1ヶ月の出勤日数をカウント
  const recentAttendances = attendanceDates.filter(dateStr => {
    const date = new Date(dateStr);
    return date >= oneMonthAgo;
  });

  // 12日以上（週3換算）→ レギュラー
  if (recentAttendances.length >= 12) {
    return GirlTag.REGULAR;
  }

  // 1-11日 → レア
  return GirlTag.RARE;
}

// 面談が必要かどうかを判定
export function needsInterview(lastInterviewDate: string | null): boolean {
  if (!lastInterviewDate) return true;

  const lastDate = new Date(lastInterviewDate);
  const oneMonthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);

  return lastDate < oneMonthAgo;
}
