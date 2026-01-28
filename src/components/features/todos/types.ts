export type TodoFrequency = "daily" | "quarterly";

export interface Todo {
  id: string;
  title: string;
  description: string;
  frequency: TodoFrequency;
  completed: boolean;
  createdAt: string;
}

export interface DailyCompletion {
  todoId: string;
  date: string; // YYYY-MM-DD format
  completedAt: string;
}

export interface QuarterlyCompletion {
  todoId: string;
  completedMonth: string; // YYYY-MM format (e.g., "2026-03")
  completedAt: string;
}

export interface TodoState {
  todos: Todo[];
  dailyCompletions: DailyCompletion[];
  quarterlyCompletions: QuarterlyCompletion[];
}

export type TodoFormData = Omit<Todo, "id" | "createdAt">;

// 3月、6月、9月、12月が四半期確認月
export const QUARTERLY_MONTHS = [3, 6, 9, 12];

export function isQuarterlyMonth(date: Date = new Date()): boolean {
  return QUARTERLY_MONTHS.includes(date.getMonth() + 1);
}

export function getCurrentQuarterMonth(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // 現在の四半期月を計算
  if (month <= 3) return `${year}-03`;
  if (month <= 6) return `${year}-06`;
  if (month <= 9) return `${year}-09`;
  return `${year}-12`;
}

export function getNextQuarterMonth(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month < 3) return `${year}-03`;
  if (month < 6) return `${year}-06`;
  if (month < 9) return `${year}-09`;
  if (month < 12) return `${year}-12`;
  return `${year + 1}-03`;
}
