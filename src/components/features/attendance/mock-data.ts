import { AttendanceRecord, AttendanceStatus } from "./types";

// 採用済みの女の子リスト（実際はgirlsからフィルタする）
export const hiredGirls = [
  { id: "1", name: "さくら" },
  { id: "2", name: "ひなた" },
  { id: "3", name: "あおい" },
  { id: "4", name: "りん" },
];

// 今日の日付を取得
const today = new Date().toISOString().split("T")[0];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "att-1",
    girlId: "1",
    girlName: "田中 花子",
    date: today,
    status: AttendanceStatus.PRESENT,
    startTime: "18:00",
    endTime: "24:00",
  },
  {
    id: "att-2",
    girlId: "2",
    girlName: "佐藤 美咲",
    date: today,
    status: AttendanceStatus.UNCERTAIN,
  },
  {
    id: "att-3",
    girlId: "3",
    girlName: "鈴木 あかり",
    date: today,
    status: AttendanceStatus.NONE,
  },
];
