"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Todo,
  TodoStatus,
  TodoPriority,
  initialTodos,
} from "@/lib/mock-data/todos";

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority: TodoPriority;
  dueDate?: string;
  assignee?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
  assignee?: string;
}

export interface TodoFilters {
  status?: TodoStatus | "all";
  priority?: TodoPriority | "all";
  search?: string;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filters, setFilters] = useState<TodoFilters>({
    status: "all",
    priority: "all",
    search: "",
  });

  // ID生成
  const generateId = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // タスク作成
  const createTodo = useCallback(
    (input: CreateTodoInput): Todo => {
      const now = new Date().toISOString();
      const newTodo: Todo = {
        id: generateId(),
        title: input.title,
        description: input.description,
        status: "pending",
        priority: input.priority,
        dueDate: input.dueDate,
        assignee: input.assignee,
        createdAt: now,
        updatedAt: now,
      };

      setTodos((prev) => [newTodo, ...prev]);
      return newTodo;
    },
    [generateId]
  );

  // タスク更新
  const updateTodo = useCallback(
    (id: string, input: UpdateTodoInput): Todo | null => {
      let updatedTodo: Todo | null = null;

      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === id) {
            updatedTodo = {
              ...todo,
              ...input,
              updatedAt: new Date().toISOString(),
            };
            return updatedTodo;
          }
          return todo;
        })
      );

      return updatedTodo;
    },
    []
  );

  // タスク削除
  const deleteTodo = useCallback((id: string): boolean => {
    let deleted = false;

    setTodos((prev) => {
      const newTodos = prev.filter((todo) => {
        if (todo.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });
      return newTodos;
    });

    return deleted;
  }, []);

  // ステータス変更（ショートカット）
  const updateStatus = useCallback(
    (id: string, status: TodoStatus): Todo | null => {
      return updateTodo(id, { status });
    },
    [updateTodo]
  );

  // タスク取得（単一）
  const getTodoById = useCallback(
    (id: string): Todo | undefined => {
      return todos.find((todo) => todo.id === id);
    },
    [todos]
  );

  // フィルタリングされたタスク一覧
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // ステータスフィルター
      if (filters.status && filters.status !== "all") {
        if (todo.status !== filters.status) return false;
      }

      // 優先度フィルター
      if (filters.priority && filters.priority !== "all") {
        if (todo.priority !== filters.priority) return false;
      }

      // 検索フィルター
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchTitle = todo.title.toLowerCase().includes(searchLower);
        const matchDescription = todo.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchAssignee = todo.assignee
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchTitle && !matchDescription && !matchAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [todos, filters]);

  // 統計情報
  const stats = useMemo(() => {
    const total = todos.length;
    const pending = todos.filter((t) => t.status === "pending").length;
    const inProgress = todos.filter((t) => t.status === "in_progress").length;
    const completed = todos.filter((t) => t.status === "completed").length;
    const highPriority = todos.filter(
      (t) => t.priority === "high" && t.status !== "completed"
    ).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [todos]);

  return {
    // データ
    todos: filteredTodos,
    allTodos: todos,
    stats,

    // フィルター
    filters,
    setFilters,

    // CRUD操作
    createTodo,
    updateTodo,
    deleteTodo,
    updateStatus,
    getTodoById,
  };
}

// 型エクスポート
export type { Todo, TodoStatus, TodoPriority };
