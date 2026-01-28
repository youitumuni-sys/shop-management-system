import { Todo, TodoState } from "./types";

const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split("T")[0];

export const defaultDailyTodos: Todo[] = [
  {
    id: "daily-1",
    title: "出勤確認",
    description: "スタッフの出勤状況を確認する",
    frequency: "daily",
    completed: false,
    createdAt: formatDate(today),
  },
  {
    id: "daily-2",
    title: "写メ日記チェック",
    description: "本日の写メ日記投稿を確認する",
    frequency: "daily",
    completed: false,
    createdAt: formatDate(today),
  },
];

export const defaultQuarterlyTodos: Todo[] = [
  {
    id: "quarterly-1",
    title: "イベント見直し",
    description: "イベント内容や効果を見直す",
    frequency: "quarterly",
    completed: false,
    createdAt: formatDate(today),
  },
  {
    id: "quarterly-2",
    title: "パネル見直し",
    description: "店舗パネルの内容を確認・更新する",
    frequency: "quarterly",
    completed: false,
    createdAt: formatDate(today),
  },
  {
    id: "quarterly-3",
    title: "料金プラン確認",
    description: "料金プランの見直しと競合調査",
    frequency: "quarterly",
    completed: false,
    createdAt: formatDate(today),
  },
  {
    id: "quarterly-4",
    title: "広告効果確認",
    description: "広告の効果測定と改善点の洗い出し",
    frequency: "quarterly",
    completed: false,
    createdAt: formatDate(today),
  },
];

export const initialTodos: Todo[] = [...defaultDailyTodos, ...defaultQuarterlyTodos];

export const initialTodoState: TodoState = {
  todos: initialTodos,
  dailyCompletions: [],
  quarterlyCompletions: [],
};
