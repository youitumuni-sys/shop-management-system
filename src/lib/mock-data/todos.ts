export type TodoPriority = "high" | "medium" | "low";
export type TodoStatus = "pending" | "in_progress" | "completed";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export const initialTodos: Todo[] = [
  {
    id: "1",
    title: "新人女の子の面接対応",
    description: "14時から面接予定。履歴書確認済み。",
    status: "pending",
    priority: "high",
    dueDate: "2024-01-15",
    assignee: "田中",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "2",
    title: "週間シフト表作成",
    description: "来週分のシフト表を作成する",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-01-12",
    assignee: "管理者",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-11T14:30:00Z",
  },
  {
    id: "3",
    title: "備品発注（タオル・アメニティ）",
    description: "在庫が少なくなっているため発注",
    status: "pending",
    priority: "medium",
    dueDate: "2024-01-16",
    createdAt: "2024-01-09T11:00:00Z",
    updatedAt: "2024-01-09T11:00:00Z",
  },
  {
    id: "4",
    title: "ホームページ写真更新",
    description: "新しい女の子のプロフィール写真をアップロード",
    status: "completed",
    priority: "medium",
    assignee: "佐藤",
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-10T16:00:00Z",
  },
  {
    id: "5",
    title: "エアコンフィルター清掃",
    description: "全室のエアコンフィルターを清掃",
    status: "pending",
    priority: "low",
    dueDate: "2024-01-20",
    createdAt: "2024-01-07T13:00:00Z",
    updatedAt: "2024-01-07T13:00:00Z",
  },
  {
    id: "6",
    title: "給与計算",
    description: "今月分の給与計算を完了させる",
    status: "pending",
    priority: "high",
    dueDate: "2024-01-25",
    assignee: "管理者",
    createdAt: "2024-01-10T09:30:00Z",
    updatedAt: "2024-01-10T09:30:00Z",
  },
  {
    id: "7",
    title: "防犯カメラ点検",
    description: "月次点検を実施",
    status: "completed",
    priority: "medium",
    createdAt: "2024-01-03T10:00:00Z",
    updatedAt: "2024-01-08T11:00:00Z",
  },
  {
    id: "8",
    title: "顧客アンケート集計",
    description: "先月分のアンケート結果を集計してレポート作成",
    status: "in_progress",
    priority: "low",
    assignee: "鈴木",
    createdAt: "2024-01-06T14:00:00Z",
    updatedAt: "2024-01-11T10:00:00Z",
  },
];

// ユーティリティ関数
export const getPriorityLabel = (priority: TodoPriority): string => {
  const labels: Record<TodoPriority, string> = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return labels[priority];
};

export const getStatusLabel = (status: TodoStatus): string => {
  const labels: Record<TodoStatus, string> = {
    pending: "未着手",
    in_progress: "進行中",
    completed: "完了",
  };
  return labels[status];
};

export const getPriorityColor = (priority: TodoPriority): string => {
  const colors: Record<TodoPriority, string> = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  };
  return colors[priority];
};

export const getStatusColor = (status: TodoStatus): string => {
  const colors: Record<TodoStatus, string> = {
    pending: "secondary",
    in_progress: "default",
    completed: "outline",
  };
  return colors[status];
};
