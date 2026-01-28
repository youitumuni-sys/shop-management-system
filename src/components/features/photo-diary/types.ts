// 写メ日記チェックの型定義

export interface PhotoDiaryEntry {
  id: string;
  girlId: string;
  girlName: string;
  date: string; // YYYY-MM-DD形式
  post1: boolean; // 1本目
  post2: boolean; // 2本目
  post3: boolean; // 3本目
  note?: string;
}

export interface DailyStats {
  total: number; // 出勤者数
  post1Count: number; // 1本目完了数
  post2Count: number; // 2本目完了数
  post3Count: number; // 3本目完了数
  achievementRate: number; // 達成率（%）
}
