// 出勤管理 - モックデータと型定義

// ===== 新しいCRUD向けステータス（○×△） =====
export const ATTENDANCE_STATUS = {
  PRESENT: "○", // 出勤
  ABSENT: "×", // 欠勤
  TENTATIVE: "△", // 未定・要確認
} as const;

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export interface Attendance {
  id: string;
  girlId: string;
  date: string; // YYYY-MM-DD形式
  status: AttendanceStatus;
  startTime?: string; // HH:MM形式
  endTime?: string; // HH:MM形式
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

// 今日の日付を基準にモックデータを生成
const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split("T")[0];

// 日付を加算するヘルパー関数
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const initialAttendances: Attendance[] = [
  // 田中花子（id: 1）の出勤データ
  {
    id: "att-1",
    girlId: "1",
    date: formatDate(today),
    status: ATTENDANCE_STATUS.PRESENT,
    startTime: "18:00",
    endTime: "24:00",
    note: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-2",
    girlId: "1",
    date: formatDate(addDays(today, 1)),
    status: ATTENDANCE_STATUS.PRESENT,
    startTime: "19:00",
    endTime: "25:00",
    note: "遅め出勤希望",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-3",
    girlId: "1",
    date: formatDate(addDays(today, 2)),
    status: ATTENDANCE_STATUS.ABSENT,
    note: "私用のため休み",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 佐藤美咲（id: 2）の出勤データ
  {
    id: "att-4",
    girlId: "2",
    date: formatDate(today),
    status: ATTENDANCE_STATUS.TENTATIVE,
    note: "体調次第で連絡",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-5",
    girlId: "2",
    date: formatDate(addDays(today, 1)),
    status: ATTENDANCE_STATUS.PRESENT,
    startTime: "20:00",
    endTime: "26:00",
    note: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-6",
    girlId: "2",
    date: formatDate(addDays(today, 3)),
    status: ATTENDANCE_STATUS.PRESENT,
    startTime: "18:00",
    endTime: "23:00",
    note: "早上がり希望",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 鈴木あかり（id: 3）の出勤データ
  {
    id: "att-7",
    girlId: "3",
    date: formatDate(today),
    status: ATTENDANCE_STATUS.PRESENT,
    startTime: "17:00",
    endTime: "24:00",
    note: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-8",
    girlId: "3",
    date: formatDate(addDays(today, 2)),
    status: ATTENDANCE_STATUS.TENTATIVE,
    note: "確認中",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 過去のデータ
  {
    id: "att-9",
    girlId: "1",
    date: formatDate(addDays(today, -1)),
    status: ATTENDANCE_STATUS.PRESENT,
    startTime: "18:00",
    endTime: "24:00",
    note: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-10",
    girlId: "2",
    date: formatDate(addDays(today, -1)),
    status: ATTENDANCE_STATUS.ABSENT,
    note: "急遽キャンセル",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ステータスのラベル取得
export const getStatusLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    "○": "出勤",
    "×": "欠勤",
    "△": "未定",
  };
  return labels[status];
};

// ステータスの色取得
export const getStatusColor = (status: AttendanceStatus): string => {
  const colors: Record<AttendanceStatus, string> = {
    "○": "bg-green-500",
    "×": "bg-red-500",
    "△": "bg-yellow-500",
  };
  return colors[status];
};

// ===== レガシー形式（AttendanceSummaryコンポーネント用） =====
export interface AttendanceRecord {
  id: string;
  girlId: string;
  girlName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: "scheduled" | "working" | "completed" | "absent";
}

// 女の子のマスターデータ（レガシー用）
const girls = [
  { id: "1", name: "田中花子" },
  { id: "2", name: "佐藤美咲" },
  { id: "3", name: "鈴木あかり" },
  { id: "4", name: "山田さくら" },
  { id: "5", name: "高橋ゆい" },
];

// 今月の出勤データを生成（レガシー形式）
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = new Date(year, month, day).getDay();

    // 週末は多め、平日は少なめ
    const baseCount = dayOfWeek === 0 || dayOfWeek === 6 ? 4 : 3;
    const attendanceCount = baseCount + Math.floor(Math.random() * 2);

    // 女の子を選択
    const shuffled = [...girls].sort(() => Math.random() - 0.5);
    const selectedGirls = shuffled.slice(
      0,
      Math.min(attendanceCount, girls.length)
    );

    selectedGirls.forEach((girl, index) => {
      const startHour = 17 + Math.floor(Math.random() * 3); // 17-19時開始
      const workHours = 5 + Math.floor(Math.random() * 3); // 5-7時間勤務

      const isPast = new Date(date) < new Date(now.toDateString());
      const isToday = date === now.toISOString().split("T")[0];

      let status: AttendanceRecord["status"] = "scheduled";
      if (isPast) {
        status = Math.random() > 0.1 ? "completed" : "absent";
      } else if (isToday) {
        status = index < 2 ? "working" : "scheduled";
      }

      records.push({
        id: `${date}-${girl.id}`,
        girlId: girl.id,
        girlName: girl.name,
        date,
        startTime: `${String(startHour).padStart(2, "0")}:00`,
        endTime: `${String(startHour + workHours).padStart(2, "0")}:00`,
        status,
      });
    });
  }

  return records;
};

export const attendanceRecords = generateMockAttendance();

// 日付ごとの出勤データを取得（レガシー）
export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  return attendanceRecords.filter((record) => record.date === date);
};

// 月の出勤サマリーを取得（レガシー）
export const getMonthlyAttendanceSummary = (
  year: number,
  month: number
): Map<string, number> => {
  const summary = new Map<string, number>();

  attendanceRecords.forEach((record) => {
    const recordDate = new Date(record.date);
    if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
      const count = summary.get(record.date) || 0;
      summary.set(record.date, count + 1);
    }
  });

  return summary;
};
