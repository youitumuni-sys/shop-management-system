"use client";

import { useState, useCallback } from "react";
import {
  Attendance,
  AttendanceStatus,
  ATTENDANCE_STATUS,
  initialAttendances,
} from "@/lib/mock-data/attendance";

export interface CreateAttendanceInput {
  girlId: string;
  date: string;
  status: AttendanceStatus;
  startTime?: string;
  endTime?: string;
  note?: string;
}

export interface UpdateAttendanceInput {
  girlId?: string;
  date?: string;
  status?: AttendanceStatus;
  startTime?: string;
  endTime?: string;
  note?: string;
}

export function useAttendance() {
  const [attendances, setAttendances] =
    useState<Attendance[]>(initialAttendances);

  // Create - 新規追加
  const createAttendance = useCallback(
    (input: CreateAttendanceInput): Attendance => {
      const now = new Date();
      const newAttendance: Attendance = {
        id: crypto.randomUUID(),
        girlId: input.girlId,
        date: input.date,
        status: input.status,
        startTime: input.startTime,
        endTime: input.endTime,
        note: input.note || "",
        createdAt: now,
        updatedAt: now,
      };

      setAttendances((prev) => [...prev, newAttendance]);
      return newAttendance;
    },
    []
  );

  // Read - 全件取得（フィルタリング対応）
  const getAttendances = useCallback(
    (filters?: {
      girlId?: string;
      date?: string;
      status?: AttendanceStatus;
      startDate?: string;
      endDate?: string;
    }): Attendance[] => {
      if (!filters) return attendances;

      return attendances.filter((att) => {
        if (filters.girlId && att.girlId !== filters.girlId) return false;
        if (filters.date && att.date !== filters.date) return false;
        if (filters.status && att.status !== filters.status) return false;
        if (filters.startDate && att.date < filters.startDate) return false;
        if (filters.endDate && att.date > filters.endDate) return false;
        return true;
      });
    },
    [attendances]
  );

  // Read - 1件取得
  const getAttendanceById = useCallback(
    (id: string): Attendance | undefined => {
      return attendances.find((att) => att.id === id);
    },
    [attendances]
  );

  // Read - 特定の女の子の出勤一覧
  const getAttendancesByGirlId = useCallback(
    (girlId: string): Attendance[] => {
      return attendances.filter((att) => att.girlId === girlId);
    },
    [attendances]
  );

  // Read - 特定の日付の出勤一覧
  const getAttendancesByDate = useCallback(
    (date: string): Attendance[] => {
      return attendances.filter((att) => att.date === date);
    },
    [attendances]
  );

  // Update - 更新
  const updateAttendance = useCallback(
    (id: string, input: UpdateAttendanceInput): Attendance | undefined => {
      let updatedAttendance: Attendance | undefined;

      setAttendances((prev) =>
        prev.map((att) => {
          if (att.id === id) {
            updatedAttendance = {
              ...att,
              ...input,
              updatedAt: new Date(),
            };
            return updatedAttendance;
          }
          return att;
        })
      );

      return updatedAttendance;
    },
    []
  );

  // Update - ステータス変更
  const updateAttendanceStatus = useCallback(
    (id: string, status: AttendanceStatus): Attendance | undefined => {
      return updateAttendance(id, { status });
    },
    [updateAttendance]
  );

  // Delete - 削除
  const deleteAttendance = useCallback((id: string): boolean => {
    let deleted = false;

    setAttendances((prev) => {
      const filtered = prev.filter((att) => att.id !== id);
      deleted = filtered.length < prev.length;
      return filtered;
    });

    return deleted;
  }, []);

  // 統計情報 - 日別
  const getStatsByDate = useCallback(
    (date: string) => {
      const dayAttendances = attendances.filter((att) => att.date === date);
      const total = dayAttendances.length;
      const byStatus = dayAttendances.reduce(
        (acc, att) => {
          acc[att.status] = (acc[att.status] || 0) + 1;
          return acc;
        },
        {} as Record<AttendanceStatus, number>
      );

      return {
        total,
        present: byStatus[ATTENDANCE_STATUS.PRESENT] || 0,
        absent: byStatus[ATTENDANCE_STATUS.ABSENT] || 0,
        tentative: byStatus[ATTENDANCE_STATUS.TENTATIVE] || 0,
      };
    },
    [attendances]
  );

  // 統計情報 - 女の子別
  const getStatsByGirl = useCallback(
    (girlId: string) => {
      const girlAttendances = attendances.filter(
        (att) => att.girlId === girlId
      );
      const total = girlAttendances.length;
      const byStatus = girlAttendances.reduce(
        (acc, att) => {
          acc[att.status] = (acc[att.status] || 0) + 1;
          return acc;
        },
        {} as Record<AttendanceStatus, number>
      );

      return {
        total,
        present: byStatus[ATTENDANCE_STATUS.PRESENT] || 0,
        absent: byStatus[ATTENDANCE_STATUS.ABSENT] || 0,
        tentative: byStatus[ATTENDANCE_STATUS.TENTATIVE] || 0,
      };
    },
    [attendances]
  );

  return {
    attendances,
    createAttendance,
    getAttendances,
    getAttendanceById,
    getAttendancesByGirlId,
    getAttendancesByDate,
    updateAttendance,
    updateAttendanceStatus,
    deleteAttendance,
    getStatsByDate,
    getStatsByGirl,
    ATTENDANCE_STATUS,
  };
}
