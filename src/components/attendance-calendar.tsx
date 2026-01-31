"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Users, Camera, ClipboardCheck, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAttendanceSchedule } from "@/hooks/useAttendanceSchedule";
import { useScrapedPhotoDiary } from "@/hooks/useScrapedPhotoDiary";
import {
  useAttendanceTargets,
  isEventDay,
  DayType,
} from "@/hooks/useAttendanceTargets";
import { useDailyCheck } from "@/hooks/useDailyCheck";

interface DayMetrics {
  // 出勤（全体）
  attendanceCount: number | null;
  attendanceTarget: number;
  attendanceRate: number | null;
  // 夜間出勤
  nightCount: number | null;
  nightTarget: number;
  nightRate: number | null;
  // 写メ日記
  photoDiaryComplete: number | null;
  photoDiaryTotal: number | null;
  photoDiaryRate: number | null;
  // 日次チェック
  dailyCheckComplete: number | null;
  dailyCheckTotal: number | null;
  dailyCheckRate: number | null;
  // 総合達成率
  overallRate: number | null;
}

interface DayData {
  date: Date;
  dateStr: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayType: DayType;
  metrics: DayMetrics;
}

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const { data: scheduleData } = useAttendanceSchedule();
  const { data: scrapedData, stats: scrapedPhotoStats } = useScrapedPhotoDiary();
  const {
    targets,
    getTargetForDayType,
    getDayTypeLabel,
    calculateAchievementRate,
    isHoliday,
    isWeekend,
  } = useAttendanceTargets();
  const { stats: dailyStats } = useDailyCheck();

  // 今日の日付文字列
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  // 出勤データマップを構築
  const attendanceMap = useMemo(() => {
    const map = new Map<string, { total: number; night: number }>();

    // スケジュールデータから
    if (scheduleData?.schedule) {
      scheduleData.schedule.forEach((day) => {
        const nightCount = day.attendance.filter((a) => {
          const hour = parseInt(a.endTime?.split(":")[0] || "0");
          return hour >= 0 && hour <= 5;
        }).length;
        map.set(day.date, { total: day.attendance.length, night: nightCount });
      });
    }

    // 今日のデータはスクレイピングから上書き
    if (scrapedData?.attendance) {
      const nightCount = scrapedData.attendance.filter((a) => {
        const hour = parseInt(a.endTime?.split(":")[0] || "0");
        return hour >= 0 && hour <= 5;
      }).length;
      map.set(todayStr, { total: scrapedData.attendance.length, night: nightCount });
    }

    return map;
  }, [scheduleData, scrapedData, todayStr]);

  // カレンダーの日付データを生成
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();

    const days: DayData[] = [];

    // 前月の日を埋める
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(createDayData(date, false));
    }

    // 今月の日を追加
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(createDayData(date, true));
    }

    // 次月の日を埋める
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(createDayData(date, false));
    }

    return days;

    function createDayData(date: Date, isCurrentMonth: boolean): DayData {
      const dateStr = formatDateStr(date);
      const dayType = getDayTypeForDate(date, dateStr);
      const attendanceTarget = getTargetForDayType(dayType);
      const isToday = dateStr === todayStr;

      const attendanceData = attendanceMap.get(dateStr);
      const attendanceCount = attendanceData?.total ?? null;
      const nightCount = attendanceData?.night ?? null;

      // 達成率計算
      const attendanceRate = attendanceCount !== null
        ? calculateAchievementRate(attendanceCount, attendanceTarget)
        : null;
      const nightRate = nightCount !== null
        ? calculateAchievementRate(nightCount, targets.nightTarget)
        : null;

      // 今日のみ写メ日記と日次チェックのデータを表示
      let photoDiaryComplete: number | null = null;
      let photoDiaryTotal: number | null = null;
      let photoDiaryRate: number | null = null;
      let dailyCheckComplete: number | null = null;
      let dailyCheckTotal: number | null = null;
      let dailyCheckRate: number | null = null;

      if (isToday) {
        if (scrapedPhotoStats) {
          photoDiaryComplete = scrapedPhotoStats.complete;
          photoDiaryTotal = scrapedPhotoStats.total;
          photoDiaryRate = scrapedPhotoStats.percentage;
        }
        if (dailyStats) {
          dailyCheckComplete = dailyStats.completed;
          dailyCheckTotal = dailyStats.total;
          dailyCheckRate = dailyStats.percentage;
        }
      }

      // 総合達成率（データがある項目のみ平均）
      const rates: number[] = [];
      if (attendanceRate !== null) rates.push(attendanceRate);
      if (nightRate !== null) rates.push(nightRate);
      if (photoDiaryRate !== null) rates.push(photoDiaryRate);
      if (dailyCheckRate !== null) rates.push(dailyCheckRate);
      const overallRate = rates.length > 0
        ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
        : null;

      return {
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        dayType,
        metrics: {
          attendanceCount,
          attendanceTarget,
          attendanceRate,
          nightCount,
          nightTarget: targets.nightTarget,
          nightRate,
          photoDiaryComplete,
          photoDiaryTotal,
          photoDiaryRate,
          dailyCheckComplete,
          dailyCheckTotal,
          dailyCheckRate,
          overallRate,
        },
      };
    }

    function formatDateStr(date: Date): string {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function getDayTypeForDate(date: Date, dateStr: string): DayType {
      if (isEventDay(date)) return "event";
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
    targets.nightTarget,
    scrapedPhotoStats,
    dailyStats,
  ]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 総合達成率に応じた背景色
  const getBackgroundColor = (day: DayData): string => {
    if (!day.isCurrentMonth) return "bg-muted/30";
    const rate = day.metrics.overallRate;
    if (rate === null) return "bg-gray-100 dark:bg-gray-800";
    if (rate >= 100) return "bg-green-100 dark:bg-green-900/40";
    if (rate >= 80) return "bg-yellow-100 dark:bg-yellow-900/40";
    if (rate >= 60) return "bg-orange-100 dark:bg-orange-900/40";
    return "bg-red-100 dark:bg-red-900/40";
  };

  // 達成率に応じた色クラス
  const getRateColorClass = (rate: number | null): string => {
    if (rate === null) return "text-gray-400";
    if (rate >= 100) return "text-green-600 dark:text-green-400";
    if (rate >= 80) return "text-yellow-600 dark:text-yellow-400";
    if (rate >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">目標カレンダー</CardTitle>
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
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/40 border border-green-300" />
              <span>100%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300" />
              <span>80%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/40 border border-orange-300" />
              <span>60%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/40 border border-red-300" />
              <span>60%未満</span>
            </div>
            <div className="flex items-center gap-1 ml-2 border-l pl-2">
              <Users className="h-3 w-3 text-blue-500" />
              <span>出勤</span>
            </div>
            <div className="flex items-center gap-1">
              <Moon className="h-3 w-3 text-indigo-500" />
              <span>夜間</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="h-3 w-3 text-pink-500" />
              <span>写メ日記</span>
            </div>
            <div className="flex items-center gap-1">
              <ClipboardCheck className="h-3 w-3 text-emerald-500" />
              <span>日次</span>
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
                  relative p-1 min-h-[80px] rounded-md transition-all
                  ${getBackgroundColor(day)}
                  ${day.isToday ? "ring-2 ring-primary" : ""}
                  hover:opacity-80 cursor-pointer
                `}
              >
                {/* 日付 */}
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

                {/* イベント日マーカー */}
                {day.dayType === "event" && day.isCurrentMonth && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full" />
                )}

                {/* メトリクス表示 */}
                {day.isCurrentMonth && day.metrics.overallRate !== null && (
                  <div className="mt-1 space-y-0.5">
                    {/* 総合達成率 */}
                    <div className={`text-[10px] font-bold ${getRateColorClass(day.metrics.overallRate)}`}>
                      {day.metrics.overallRate}%
                    </div>

                    {/* 個別指標（アイコン＋%） */}
                    <div className="grid grid-cols-2 gap-0.5 text-[8px]">
                      {/* 出勤 */}
                      <div className={`flex items-center gap-0.5 ${getRateColorClass(day.metrics.attendanceRate)}`}>
                        <Users className="h-2 w-2" />
                        <span>{day.metrics.attendanceRate ?? "-"}%</span>
                      </div>
                      {/* 夜間 */}
                      <div className={`flex items-center gap-0.5 ${getRateColorClass(day.metrics.nightRate)}`}>
                        <Moon className="h-2 w-2" />
                        <span>{day.metrics.nightRate ?? "-"}%</span>
                      </div>
                      {/* 今日のみ写メ日記・日次チェック */}
                      {day.isToday && (
                        <>
                          <div className={`flex items-center gap-0.5 ${getRateColorClass(day.metrics.photoDiaryRate)}`}>
                            <Camera className="h-2 w-2" />
                            <span>{day.metrics.photoDiaryRate ?? "-"}%</span>
                          </div>
                          <div className={`flex items-center gap-0.5 ${getRateColorClass(day.metrics.dailyCheckRate)}`}>
                            <ClipboardCheck className="h-2 w-2" />
                            <span>{day.metrics.dailyCheckRate ?? "-"}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 詳細モーダル */}
      <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && (
                <div className="flex items-center gap-2">
                  <span>
                    {selectedDay.date.getFullYear()}年
                    {selectedDay.date.getMonth() + 1}月
                    {selectedDay.day}日
                    （{weekDays[selectedDay.date.getDay()]}）
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
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
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-4">
              {/* 総合達成率 */}
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">総合達成率</p>
                <p className={`text-4xl font-bold ${getRateColorClass(selectedDay.metrics.overallRate)}`}>
                  {selectedDay.metrics.overallRate !== null ? `${selectedDay.metrics.overallRate}%` : "-"}
                </p>
              </div>

              {/* 個別指標 */}
              <div className="space-y-3">
                {/* 出勤（全体） */}
                <MetricRow
                  icon={<Users className="h-4 w-4 text-blue-500" />}
                  label="出勤（全体）"
                  current={selectedDay.metrics.attendanceCount}
                  target={selectedDay.metrics.attendanceTarget}
                  rate={selectedDay.metrics.attendanceRate}
                  unit="人"
                />

                {/* 夜間出勤 */}
                <MetricRow
                  icon={<Moon className="h-4 w-4 text-indigo-500" />}
                  label="夜間出勤"
                  current={selectedDay.metrics.nightCount}
                  target={selectedDay.metrics.nightTarget}
                  rate={selectedDay.metrics.nightRate}
                  unit="人"
                />

                {/* 写メ日記（今日のみ） */}
                {selectedDay.isToday && (
                  <MetricRow
                    icon={<Camera className="h-4 w-4 text-pink-500" />}
                    label="写メ日記3件達成"
                    current={selectedDay.metrics.photoDiaryComplete}
                    target={selectedDay.metrics.photoDiaryTotal}
                    rate={selectedDay.metrics.photoDiaryRate}
                    unit="人"
                  />
                )}

                {/* 日次チェック（今日のみ） */}
                {selectedDay.isToday && (
                  <MetricRow
                    icon={<ClipboardCheck className="h-4 w-4 text-emerald-500" />}
                    label="日次チェック"
                    current={selectedDay.metrics.dailyCheckComplete}
                    target={selectedDay.metrics.dailyCheckTotal}
                    rate={selectedDay.metrics.dailyCheckRate}
                    unit="項目"
                  />
                )}
              </div>

              {/* 目標設定情報 */}
              <div className="text-xs text-muted-foreground border-t pt-3">
                <p className="font-medium mb-1">目標設定:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span>平日: {targets.weekdayTarget}人</span>
                  <span>土日祝: {targets.weekendTarget}人</span>
                  <span>イベント日: {targets.eventTarget}人</span>
                  <span>夜間: {targets.nightTarget}人</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// 個別指標の行コンポーネント
function MetricRow({
  icon,
  label,
  current,
  target,
  rate,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  current: number | null;
  target: number | null;
  rate: number | null;
  unit: string;
}) {
  const getRateColor = (r: number | null): string => {
    if (r === null) return "text-gray-400";
    if (r >= 100) return "text-green-600 dark:text-green-400";
    if (r >= 80) return "text-yellow-600 dark:text-yellow-400";
    if (r >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (r: number | null): string => {
    if (r === null) return "bg-gray-300";
    if (r >= 100) return "bg-green-500";
    if (r >= 80) return "bg-yellow-500";
    if (r >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {current !== null ? current : "-"} / {target !== null ? target : "-"} {unit}
          </span>
          <span className={`text-sm font-bold ${getRateColor(rate)}`}>
            {rate !== null ? `${rate}%` : "-"}
          </span>
        </div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <div
          className={`h-full transition-all ${getProgressColor(rate)}`}
          style={{ width: `${Math.min(rate ?? 0, 100)}%` }}
        />
      </div>
    </div>
  );
}
