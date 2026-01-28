"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Todo,
  TodoState,
  TodoFormData,
  DailyCompletion,
  QuarterlyCompletion,
  getCurrentQuarterMonth,
  isQuarterlyMonth,
} from "./types";
import { initialTodoState } from "./mockData";

const STORAGE_KEY = "todos-frequency-state";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function loadFromStorage(): TodoState {
  if (typeof window === "undefined") return initialTodoState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load todos from storage:", error);
  }
  return initialTodoState;
}

function saveToStorage(state: TodoState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save todos to storage:", error);
  }
}

export function useFrequencyTodos() {
  const [state, setState] = useState<TodoState>(initialTodoState);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回ロード
  useEffect(() => {
    const loaded = loadFromStorage();
    setState(loaded);
    setIsLoaded(true);
  }, []);

  // 状態変更時に保存
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state);
    }
  }, [state, isLoaded]);

  // 日付を取得
  const today = getTodayDate();
  const currentQuarterMonth = getCurrentQuarterMonth();
  const isCurrentlyQuarterlyMonth = isQuarterlyMonth();

  // 毎日やることリスト
  const dailyTodos = useMemo(() => {
    return state.todos.filter((todo) => todo.frequency === "daily");
  }, [state.todos]);

  // 3ヶ月ごとにやることリスト
  const quarterlyTodos = useMemo(() => {
    return state.todos.filter((todo) => todo.frequency === "quarterly");
  }, [state.todos]);

  // 今日の完了状態を確認
  const isDailyCompleted = useCallback(
    (todoId: string): boolean => {
      return state.dailyCompletions.some(
        (c) => c.todoId === todoId && c.date === today
      );
    },
    [state.dailyCompletions, today]
  );

  // 現在の四半期月で完了しているか確認
  const isQuarterlyCompleted = useCallback(
    (todoId: string): boolean => {
      return state.quarterlyCompletions.some(
        (c) => c.todoId === todoId && c.completedMonth === currentQuarterMonth
      );
    },
    [state.quarterlyCompletions, currentQuarterMonth]
  );

  // 毎日タスクの完了トグル
  const toggleDailyComplete = useCallback((todoId: string) => {
    setState((prev) => {
      const isCompleted = prev.dailyCompletions.some(
        (c) => c.todoId === todoId && c.date === getTodayDate()
      );

      if (isCompleted) {
        // 完了を取り消す
        return {
          ...prev,
          dailyCompletions: prev.dailyCompletions.filter(
            (c) => !(c.todoId === todoId && c.date === getTodayDate())
          ),
        };
      } else {
        // 完了にする
        const newCompletion: DailyCompletion = {
          todoId,
          date: getTodayDate(),
          completedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          dailyCompletions: [...prev.dailyCompletions, newCompletion],
        };
      }
    });
  }, []);

  // 四半期タスクの完了トグル
  const toggleQuarterlyComplete = useCallback((todoId: string) => {
    const currentMonth = getCurrentQuarterMonth();

    setState((prev) => {
      const isCompleted = prev.quarterlyCompletions.some(
        (c) => c.todoId === todoId && c.completedMonth === currentMonth
      );

      if (isCompleted) {
        // 完了を取り消す
        return {
          ...prev,
          quarterlyCompletions: prev.quarterlyCompletions.filter(
            (c) => !(c.todoId === todoId && c.completedMonth === currentMonth)
          ),
        };
      } else {
        // 完了にする
        const newCompletion: QuarterlyCompletion = {
          todoId,
          completedMonth: currentMonth,
          completedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          quarterlyCompletions: [...prev.quarterlyCompletions, newCompletion],
        };
      }
    });
  }, []);

  // タスク追加
  const addTodo = useCallback((data: TodoFormData) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setState((prev) => ({
      ...prev,
      todos: [...prev.todos, newTodo],
    }));

    return newTodo;
  }, []);

  // タスク更新
  const updateTodo = useCallback((id: string, data: Partial<TodoFormData>) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) =>
        todo.id === id ? { ...todo, ...data } : todo
      ),
    }));
  }, []);

  // タスク削除
  const deleteTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((todo) => todo.id !== id),
      dailyCompletions: prev.dailyCompletions.filter((c) => c.todoId !== id),
      quarterlyCompletions: prev.quarterlyCompletions.filter(
        (c) => c.todoId !== id
      ),
    }));
  }, []);

  // 今日の毎日タスク完了率
  const dailyProgress = useMemo(() => {
    if (dailyTodos.length === 0) return 0;
    const completed = dailyTodos.filter((todo) =>
      isDailyCompleted(todo.id)
    ).length;
    return Math.round((completed / dailyTodos.length) * 100);
  }, [dailyTodos, isDailyCompleted]);

  // 四半期タスク完了率
  const quarterlyProgress = useMemo(() => {
    if (quarterlyTodos.length === 0) return 0;
    const completed = quarterlyTodos.filter((todo) =>
      isQuarterlyCompleted(todo.id)
    ).length;
    return Math.round((completed / quarterlyTodos.length) * 100);
  }, [quarterlyTodos, isQuarterlyCompleted]);

  // 未完了の四半期タスク数（リマインダー用）
  const pendingQuarterlyCount = useMemo(() => {
    if (!isCurrentlyQuarterlyMonth) return 0;
    return quarterlyTodos.filter((todo) => !isQuarterlyCompleted(todo.id))
      .length;
  }, [quarterlyTodos, isQuarterlyCompleted, isCurrentlyQuarterlyMonth]);

  // 古い完了記録をクリーンアップ（30日以上前の毎日タスク）
  const cleanupOldCompletions = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];

    setState((prev) => ({
      ...prev,
      dailyCompletions: prev.dailyCompletions.filter(
        (c) => c.date >= cutoffDate
      ),
    }));
  }, []);

  // 初回ロード時にクリーンアップ実行
  useEffect(() => {
    if (isLoaded) {
      cleanupOldCompletions();
    }
  }, [isLoaded, cleanupOldCompletions]);

  return {
    // データ
    dailyTodos,
    quarterlyTodos,
    isLoaded,

    // 完了状態
    isDailyCompleted,
    isQuarterlyCompleted,

    // 完了トグル
    toggleDailyComplete,
    toggleQuarterlyComplete,

    // CRUD
    addTodo,
    updateTodo,
    deleteTodo,

    // 統計
    dailyProgress,
    quarterlyProgress,
    pendingQuarterlyCount,

    // 四半期月情報
    isCurrentlyQuarterlyMonth,
    currentQuarterMonth,
  };
}
