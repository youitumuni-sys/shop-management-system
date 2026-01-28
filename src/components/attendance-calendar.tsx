"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAttendanceSchedule } from "@/hooks/useAttendanceSchedule";
import { useScrapedPhotoDiary } from "@/hooks/useScrapedPhotoDiary";
import {
  useAttendanceTargets,
  isEventDay,
  DayType,
} from "@/hooks/useAttendanceTargets";

interface DayData {
  date: Date;
  dateStr: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  attendanceCount: number | null;
  target: number;
  achievementRate: number | null;
  dayType: DayType;
}

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const { data: scheduleData } = useAttendanceSchedule();
  const { data: scrapedData } = useScrapedPhotoDiary();
  const {
    targets,
    getTargetForDayType,
    getDayTypeLabel,
    calculateAchievementRate,
    isHoliday,
    isWeekend,
  } = useAttendanceTargets();

  // 今日の日付文字列
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  // 出勤データマップを構築
  const attendanceMap = useMemo(() => {
    const map = new Map<string, number>();

    // スケジュールデータから
    if (scheduleData?.schedule) {
      scheduleData.schedule.forEach((day) => {
        map.set(day.date, day.attendance.length);
      });
    }

    // 今日のデータはスクレイピングから上書き
    if (scrapedData?.attendance) {
      map.set(todayStr, scrapedData.attendance.length);
    }

    return map;
  }, [scheduleData, scrapedData, todayStr]);

  // カレンダーの日付データを生成
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 月の最初の日の曜日（0=日曜）
    const firstDayOfWeek = firstDay.getDay();

    // カレンダーに表示する日付配列
    const days: DayData[] = [];

    // 前月の日を埋める
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateStr = formatDateStr(date);
      const dayType = getDayTypeForDate(date, dateStr);
      const target = getTargetForDayType(dayType);
      const count = attendanceMap.get(dateStr) ?? null;

      days.push({
        date,
        dateStr,
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        attendanceCount: count,
        target,
        achievementRate: count !== null ? calculateAchievementRate(count, target) : null,
        dayType,
      });
    }

    // 今月の日を追加
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateStr(date);
      const dayType = getDayTypeForDate(date, dateStr);
      const target = getTargetForDayType(dayType);
      const count = attendanceMap.get(dateStr) ?? null;

      days.push({
        date,
        dateStr,
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        attendanceCount: count,
        target,
        achievementRate: count !== null ? calculateAchievementRate(count, target) : null,
        dayType,
      });
    }

    // 次月の日を埋める（6週間分になるように）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = formatDateStr(date);
      const dayType = getDayTypeForDate(date, dateStr);
      const target = getTargetForDayType(dayType);
      const count = attendanceMap.get(dateStr) ?? null;

      days.push({
        date,
        dateStr,
        day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        attendanceCount: count,
        target,
        achievementRate: count !== null ? calculateAchievementRate(count, target) : null,
        dayType,
      });
    }

    return days;

    function formatDateStr(date: Date): string {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function getDayTypeForDate(date: Date, dateStr: string): DayType {
      // イベント日チェック（末尾2/8）
      if (isEventDay(date)) return "event";
      // 週末・祝日チェック
      if (isWeekend(date) || isHoliday(dateStr)) return "weekend";
      return "weekday";
    }
  }, [
    currentDate,
    todayStr,
    attendanceMap,
    getTargetForDayType,
    calculateAchievementRate,
    isHoliday,
    isWeekend,
  ]);

  // 月を変更
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 達成率に応じた背景色
  const getBackgroundColor = (day: DayData): string => {
    if (!day.isCurrentMonth) return "bg-muted/30";
    if (day.achievementRate === null) return "bg-gray-100 dark:bg-gray-800";
    if (day.achievementRate >= 100) return "bg-green-100 dark:bg-green-900/40";
    if (day.achievementRate >= 80) return "bg-yellow-100 dark:bg-yellow-900/40";
    return "bg-red-100 dark:bg-red-900/40";
  };

  // 達成率に応じたテキスト色
  const getTextColor = (day: DayData): string => {
    if (!day.isCurrentMonth) return "text-muted-foreground/50";
    if (day.achievementRate === null) return "text-gray-400 dark:text-gray-500";
    if (day.achievementRate >= 100) return "text-green-600 dark:text-green-400";
    if (day.achievementRate >= 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">出勤カレンダー</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              今日
            </Button>
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 凡例 */}
          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/40 border border-green-300" />
              <span>100%以上</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300" />
              <span>80%以上</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/40 border border-red-300" />
              <span>80%未満</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300" />
              <span>データなし</span>
            </div>
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1">
            {/* 曜日ヘッダー */}
            {weekDays.map((day, idx) => (
              <div
                key={day}
                className={`text-center text-xs font-medium py-2 ${
                  idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}

            {/* 日付セル */}
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`
                  relative p-1 min-h-[60px] rounded-md transition-all
                  ${getBackgroundColor(day)}
                  ${day.isToday ? "ring-2 ring-primary" : ""}
                  hover:opacity-80 cursor-pointer
                `}
              >
                <div
                  className={`text-xs font-medium ${
                    !day.isCurrentMonth
                      ? "text-muted-foreground/50"
                      : day.date.getDay() === 0
                        ? "text-red-500"
                        : day.date.getDay() === 6
                          ? "text-blue-500"
                          : ""
                  }`}
                >
                  {day.day}
                </div>
                {day.attendanceCount !== null && day.isCurrentMonth && (
                  <div className="mt-1">
                    <div className="text-[10px] text-muted-foreground">
                      {day.attendanceCount}人
                    </div>
                    <div className={`text-[10px] font-bold ${getTextColor(day)}`}>
                      {day.achievementRate}%
                    </div>
                  </div>
                )}
                {day.dayType === "event" && day.isCurrentMonth && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 詳細モーダル */}
      <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && (
                <>
                  {selectedDay.date.getFullYear()}年
                  {selectedDay.date.getMonth() + 1}月
                  {selectedDay.day}日
                  （{weekDays[selectedDay.date.getDay()]}）
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-4">
              {/* 日付タイプ */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">日付タイプ:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedDay.dayType === "event"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      : selectedDay.dayType === "weekend"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {getDayTypeLabel(selectedDay.dayType)}
                </span>
              </div>

              {/* 出勤情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">出勤者数</p>
                  <p className="text-2xl font-bold">
                    {selectedDay.attendanceCount !== null
                      ? `${selectedDay.attendanceCount}人`
                      : "-"}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">目標人数</p>
                  <p className="text-2xl font-bold">{selectedDay.target}人</p>
                </div>
              </div>

              {/* 達成率 */}
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">達成率</p>
                {selectedDay.achievementRate !== null ? (
                  <p
                    className={`text-3xl font-bold ${
                      selectedDay.achievementRate >= 100
                        ? "text-green-500"
                        : selectedDay.achievementRate >= 80
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {selectedDay.achievementRate}%
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-gray-400">-</p>
                )}
              </div>

              {/* 目標情報 */}
              <div className="text-xs text-muted-foreground">
                <p>目標設定:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>平日: {targets.weekdayTarget}人</li>
                  <li>土日祝: {targets.weekendTarget}人</li>
                  <li>イベント日（末尾2/8）: {targets.eventTarget}人</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
