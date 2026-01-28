// イベントチェックモックデータ

export type EventStatus = "upcoming" | "ongoing" | "completed";

export interface EventCheckItem {
  id: string;
  title: string;
  checked: boolean;
  checkedAt?: string;
}

export interface ShopEvent {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  checkItems: EventCheckItem[];
}

export const mockEvents: ShopEvent[] = [
  {
    id: "e1",
    name: "新春キャンペーン",
    description: "新年特別割引イベント",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    status: "ongoing",
    checkItems: [
      { id: "e1-1", title: "ポスター掲示", checked: true, checkedAt: "2026-01-01T10:00:00" },
      { id: "e1-2", title: "HP告知更新", checked: true, checkedAt: "2026-01-01T11:00:00" },
      { id: "e1-3", title: "女の子への周知", checked: false },
      { id: "e1-4", title: "料金表更新", checked: false },
    ],
  },
  {
    id: "e2",
    name: "バレンタインイベント",
    description: "2月限定特別企画",
    startDate: "2026-02-01",
    endDate: "2026-02-14",
    status: "upcoming",
    checkItems: [
      { id: "e2-1", title: "企画内容決定", checked: false },
      { id: "e2-2", title: "ポスター作成", checked: false },
      { id: "e2-3", title: "SNS告知準備", checked: false },
    ],
  },
  {
    id: "e3",
    name: "年末カウントダウン",
    description: "2025年末イベント",
    startDate: "2025-12-25",
    endDate: "2025-12-31",
    status: "completed",
    checkItems: [
      { id: "e3-1", title: "ポスター掲示", checked: true, checkedAt: "2025-12-20T10:00:00" },
      { id: "e3-2", title: "HP告知更新", checked: true, checkedAt: "2025-12-20T11:00:00" },
      { id: "e3-3", title: "女の子への周知", checked: true, checkedAt: "2025-12-22T09:00:00" },
    ],
  },
];

export const getEventsByStatus = (status: EventStatus) =>
  mockEvents.filter((e) => e.status === status);
