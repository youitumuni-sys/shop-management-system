"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PhotoDiaryCheckResult } from "@/hooks/useScrapedPhotoDiary";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface AttendanceInfo {
  name: string;
  startTime: string;
  endTime: string;
}

interface DailyAttendance {
  date: string;
  attendance: AttendanceInfo[];
}

interface AttendanceScheduleData {
  scrapedAt: string;
  schedule: DailyAttendance[];
}

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  attendanceCount: number | null; // null = データなし
}

interface AttendanceCalendarProps {
  // 今日の出勤データ
  todayAttendance?: PhotoDiaryCheckResult[];
  // スクレイピング日時
  scrapedAt?: string;
}

export function AttendanceCalendar({ todayAttendance }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 未来の出勤スケジュールデータ
  const [scheduleData, setScheduleData] = useState<AttendanceScheduleData | null>(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 今日の日付文字列
  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }, []);

  // 今日の出勤者数
  const todayWorkingCount = useMemo(() => {
    if (!todayAttendance) return null;
    return todayAttendance.filter((r) => r.isWorking).length;
  }, [todayAttendance]);

  // スケジュールデータから日付ごとの出勤者数マップを生成
  const scheduleCountMap = useMemo((): Map<string, number> => {
    const map = new Map<string, number>();
    if (scheduleData?.schedule) {
      scheduleData.schedule.forEach((day) => {
        map.set(day.date, day.attendance.length);
      });
    }
    return map;
  }, [scheduleData]);

  // 保存済みスケジュールを取得
  const fetchSchedule = useCallback(async () => {
    try {
      setIsScheduleLoading(true);
      setScheduleError(null);
      const res = await fetch("/api/attendance-schedule");
      const json = await res.json();
      if (json.success && json.data) {
        setScheduleData(json.data);
      }
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : "取得エラー");
    } finally {
      setIsScheduleLoading(false);
    }
  }, []);

  // スケジュールを更新（スクレイピング実行）
  const refreshSchedule = useCallback(async () => {
    try {
      setIsScheduleLoading(true);
      setScheduleError(null);
      const res = await fetch("/api/attendance-schedule?days=14", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setScheduleData(json.data);
      } else {
        setScheduleError(json.message || "スクレイピング失敗");
      }
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : "実行エラー");
    } finally {
      setIsScheduleLoading(false);
    }
  }, []);

  // 初回ロード
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // カレンダーの日付を生成
  const calendarDays = useMemo((): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
      const isToday = current.getTime() === today.getTime();
      const isFuture = current.getTime() > today.getTime();

      // 出勤者数を決定
      let attendanceCount: number | null = null;
      if (isToday) {
        // 今日はtodayAttendanceデータを優先、なければスケジュールデータを使用
        attendanceCount = todayWorkingCount ?? scheduleCountMap.get(dateStr) ?? null;
      } else if (isFuture) {
        // 未来の日付はスケジュールデータを使用
        attendanceCount = scheduleCountMap.get(dateStr) ?? null;
      }

      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        isToday,
        isFuture,
        attendanceCount,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [year, month, todayWorkingCount, scheduleCountMap]);

  // 選択された日の出勤データ（今日用）
  const selectedDayTodayAttendance = useMemo(() => {
    if (!selectedDate || selectedDate !== todayStr || !todayAttendance) return [];
    return todayAttendance.filter((r) => r.isWorking);
  }, [selectedDate, todayStr, todayAttendance]);

  // 選択された日の出勤データ（未来用）
  const selectedDayScheduleAttendance = useMemo((): AttendanceInfo[] => {
    if (!selectedDate || !scheduleData?.schedule) return [];
    const dayData = scheduleData.schedule.find((d) => d.date === selectedDate);
    return dayData?.attendance || [];
  }, [selectedDate, scheduleData]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    setSelectedDate(day.dateStr);
    setIsDialogOpen(true);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 選択された日付が今日か未来かを判定
  const isSelectedDateFuture = useMemo(() => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected.getTime() > today.getTime();
  }, [selectedDate]);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              月間カレンダー
              {scheduleData?.scrapedAt && (
                <span className="text-xs font-normal text-muted-foreground">
                  (スケジュール取得: {new Date(scheduleData.scrapedAt).toLocaleString("ja-JP")})
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSchedule}
                disabled={isScheduleLoading}
              >
                {isScheduleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                スケジュール更新
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                今月
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center font-medium">
                {year}年 {month + 1}月
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {scheduleError && (
            <div className="text-sm text-red-500 mt-2">{scheduleError}</div>
          )}
        </CardHeader>
        <CardContent>
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day, index) => (
              <div
                key={day}
                className={cn(
                  "py-2 text-center text-sm font-medium",
                  index === 0 && "text-red-500",
                  index === 6 && "text-blue-500"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayOfWeek = day.date.getDay();
              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!day.isCurrentMonth}
                  className={cn(
                    "relative flex flex-col items-center justify-start p-2 min-h-[70px] rounded-lg border transition-colors",
                    day.isCurrentMonth
                      ? "bg-white hover:bg-gray-50 cursor-pointer"
                      : "bg-gray-50 text-gray-300 cursor-default",
                    day.isToday && "ring-2 ring-blue-500",
                    dayOfWeek === 0 && day.isCurrentMonth && "text-red-500",
                    dayOfWeek === 6 && day.isCurrentMonth && "text-blue-500"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      day.isToday &&
                        "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                  {day.isCurrentMonth && (
                    day.attendanceCount !== null ? (
                      <Badge
                        variant={day.isFuture ? "outline" : "secondary"}
                        className={cn(
                          "mt-1 text-xs px-1.5 py-0",
                          day.isFuture && "border-blue-400 text-blue-600 bg-blue-50"
                        )}
                      >
                        {day.attendanceCount}人
                      </Badge>
                    ) : (
                      <span className="mt-1 text-xs text-muted-foreground">-</span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 日付詳細ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              の出勤{isSelectedDateFuture ? "予定" : "状況"}
            </DialogTitle>
          </DialogHeader>

          {/* 今日の出勤データ（写メ日記情報付き） */}
          {selectedDate === todayStr && selectedDayTodayAttendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>出勤時間</TableHead>
                  <TableHead>退勤時間</TableHead>
                  <TableHead>写メ日記</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDayTodayAttendance.map((record) => (
                  <TableRow key={record.name}>
                    <TableCell className="font-medium">
                      {record.name}
                    </TableCell>
                    <TableCell>{record.startTime || "-"}</TableCell>
                    <TableCell>{record.endTime || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "complete"
                            ? "default"
                            : record.status === "partial"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {record.postCount}件
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : selectedDate === todayStr && todayAttendance && selectedDayTodayAttendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              出勤中のキャストはいません
            </p>
          ) : isSelectedDateFuture && selectedDayScheduleAttendance.length > 0 ? (
            /* 未来の出勤予定データ */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>出勤予定時間</TableHead>
                  <TableHead>退勤予定時間</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDayScheduleAttendance.map((record) => (
                  <TableRow key={record.name}>
                    <TableCell className="font-medium">
                      {record.name}
                    </TableCell>
                    <TableCell>{record.startTime || "-"}</TableCell>
                    <TableCell>{record.endTime || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : isSelectedDateFuture && selectedDayScheduleAttendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              出勤予定のキャストはいません。「スケジュール更新」ボタンで最新データを取得してください。
            </p>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {selectedDate === todayStr
                ? "出勤データを取得してください"
                : "過去の出勤履歴データは現在未対応です"}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
