"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ShopEvent, EventStatus, mockEvents } from "@/lib/mock-data/events";

const STORAGE_KEY = "shop-events-data";

function loadEventsFromStorage(): ShopEvent[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load events from localStorage:", error);
  }
  return null;
}

function saveEventsToStorage(events: ShopEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Failed to save events to localStorage:", error);
  }
}

export function useEvents() {
  const [events, setEvents] = useState<ShopEvent[]>(mockEvents);
  const [isInitialized, setIsInitialized] = useState(false);

  // クライアント側でlocalStorageからデータを読み込む
  useEffect(() => {
    const storedEvents = loadEventsFromStorage();
    if (storedEvents) {
      setEvents(storedEvents);
    }
    setIsInitialized(true);
  }, []);

  // イベントが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isInitialized) {
      saveEventsToStorage(events);
    }
  }, [events, isInitialized]);

  const toggleCheckItem = useCallback((eventId: string, itemId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;
        return {
          ...event,
          checkItems: event.checkItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  checked: !item.checked,
                  checkedAt: !item.checked ? new Date().toISOString() : undefined,
                }
              : item
          ),
        };
      })
    );
  }, []);

  const addEvent = useCallback(
    (eventData: Omit<ShopEvent, "id">) => {
      const newEvent: ShopEvent = {
        ...eventData,
        id: `e${Date.now()}`,
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    []
  );

  const updateEvent = useCallback(
    (eventId: string, eventData: Omit<ShopEvent, "id">) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...eventData, id: eventId }
            : event
        )
      );
    },
    []
  );

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  }, []);

  const getEventById = useCallback(
    (eventId: string) => {
      return events.find((e) => e.id === eventId) || null;
    },
    [events]
  );

  const getEventsByStatus = useCallback(
    (status: EventStatus) => {
      return events.filter((e) => e.status === status);
    },
    [events]
  );

  const stats = useMemo(() => {
    const ongoing = events.filter((e) => e.status === "ongoing");
    const upcoming = events.filter((e) => e.status === "upcoming");
    const completed = events.filter((e) => e.status === "completed");

    const ongoingChecks = ongoing.flatMap((e) => e.checkItems);
    const ongoingCompleted = ongoingChecks.filter((i) => i.checked).length;
    const ongoingTotal = ongoingChecks.length;
    const ongoingPercentage =
      ongoingTotal > 0 ? Math.round((ongoingCompleted / ongoingTotal) * 100) : 0;

    return {
      ongoingCount: ongoing.length,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      ongoingChecksCompleted: ongoingCompleted,
      ongoingChecksTotal: ongoingTotal,
      ongoingPercentage,
    };
  }, [events]);

  const getEventStats = useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return { total: 0, completed: 0, percentage: 0 };
      const total = event.checkItems.length;
      const completed = event.checkItems.filter((i) => i.checked).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { total, completed, percentage };
    },
    [events]
  );

  return {
    events,
    isInitialized,
    toggleCheckItem,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByStatus,
    stats,
    getEventStats,
  };
}
