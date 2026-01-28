// 出勤管理の型定義

export const AttendanceStatus = {
  PRESENT: "○", // 出勤
  ABSENT: "×", // 欠勤
  UNCERTAIN: "△", // 未定
  NONE: "-", // 未入力
} as const;

export type AttendanceStatusType =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface AttendanceRecord {
  id: string;
  girlId: string;
  girlName: string;
  date: string; // YYYY-MM-DD形式
  status: AttendanceStatusType;
  startTime?: string; // HH:MM形式
  endTime?: string; // HH:MM形式
  note?: string;
}

export interface DailyAttendance {
  date: string;
  records: AttendanceRecord[];
}
