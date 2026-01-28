import { PhotoDiaryEntry } from "./types";

// 今日の日付
const today = new Date().toISOString().split("T")[0];

// 出勤者のモックデータ
export const mockPhotoDiaryEntries: PhotoDiaryEntry[] = [
  {
    id: "pd-1",
    girlId: "1",
    girlName: "田中 花子",
    date: today,
    post1: true,
    post2: true,
    post3: false,
    note: "",
  },
  {
    id: "pd-2",
    girlId: "2",
    girlName: "佐藤 美咲",
    date: today,
    post1: true,
    post2: false,
    post3: false,
    note: "撮影中",
  },
  {
    id: "pd-3",
    girlId: "3",
    girlName: "鈴木 あかり",
    date: today,
    post1: true,
    post2: true,
    post3: true,
    note: "",
  },
  {
    id: "pd-4",
    girlId: "4",
    girlName: "山田 さくら",
    date: today,
    post1: false,
    post2: false,
    post3: false,
    note: "これから",
  },
];
