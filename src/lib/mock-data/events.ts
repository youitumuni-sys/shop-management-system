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

export const mockEvents: ShopEvent[] = [];

export const getEventsByStatus = (status: EventStatus) =>
  mockEvents.filter((e) => e.status === status);
