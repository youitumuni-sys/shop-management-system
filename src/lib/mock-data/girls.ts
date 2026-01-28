// 女の子マスタ - 新しい型定義（後方互換性のため残しているが使用非推奨）
// 新しい型定義は src/components/features/girls/types.ts を参照

export const GIRL_TAG = {
  REGULAR: "レギュラー",
  RARE: "レア",
  RETIRED: "退店",
} as const;

export type GirlTag = (typeof GIRL_TAG)[keyof typeof GIRL_TAG];

export interface Girl {
  id: string;
  name: string;
  tag: GirlTag;
  interviewed: boolean;
  lastInterviewDate: string | null;
  attendanceDates: string[];
  lastAttendance: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// 日付を生成するヘルパー関数
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

export const initialGirls: Girl[] = [
  {
    id: "1",
    name: "さよ",
    tag: GIRL_TAG.REGULAR,
    interviewed: true,
    lastInterviewDate: getDaysAgo(10),
    attendanceDates: [getDaysAgo(0), getDaysAgo(2), getDaysAgo(4), getDaysAgo(6), getDaysAgo(8), getDaysAgo(10), getDaysAgo(12), getDaysAgo(14), getDaysAgo(16), getDaysAgo(18), getDaysAgo(20), getDaysAgo(22)],
    lastAttendance: getDaysAgo(0),
    note: "接客スキル高い。週4-5日ペースで出勤中。",
    createdAt: getDaysAgo(90),
    updatedAt: getDaysAgo(0),
  },
  {
    id: "2",
    name: "ふう",
    tag: GIRL_TAG.REGULAR,
    interviewed: true,
    lastInterviewDate: getDaysAgo(20),
    attendanceDates: [getDaysAgo(0), getDaysAgo(2), getDaysAgo(5), getDaysAgo(8), getDaysAgo(11), getDaysAgo(14), getDaysAgo(17), getDaysAgo(20), getDaysAgo(23), getDaysAgo(26), getDaysAgo(29)],
    lastAttendance: getDaysAgo(0),
    note: "写メ日記を積極的に投稿。",
    createdAt: getDaysAgo(60),
    updatedAt: getDaysAgo(0),
  },
  {
    id: "3",
    name: "ゆい",
    tag: GIRL_TAG.RARE,
    interviewed: true,
    lastInterviewDate: getDaysAgo(40),
    attendanceDates: [getDaysAgo(3), getDaysAgo(10), getDaysAgo(17), getDaysAgo(24)],
    lastAttendance: getDaysAgo(3),
    note: "週1ペースの出勤希望。",
    createdAt: getDaysAgo(120),
    updatedAt: getDaysAgo(3),
  },
];
