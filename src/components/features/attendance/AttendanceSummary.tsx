"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attendanceRecords } from "@/lib/mock-data/attendance";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface GirlMonthlySummary {
  girlId: string;
  girlName: string;
  totalDays: number;
  totalHours: number;
}

interface DailyAttendanceSummary {
  date: string;
  dayOfWeek: number;
  headcount: number;
  girlNames: string[];
}

export function AttendanceSummary() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月を変更
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  // 女の子ごとの月間集計
  const girlMonthlySummaries = useMemo((): GirlMonthlySummary[] => {
    const summaryMap = new Map<
      string,
      { girlName: string; totalDays: number; totalHours: number }
    >();

    attendanceRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      if (
        recordDate.getFullYear() === year &&
        recordDate.getMonth() === month &&
        record.status === "completed"
      ) {
        const existing = summaryMap.get(record.girlId);
        // 勤務時間を計算
        const start = parseInt(record.startTime.split(":")[0], 10);
        const end = parseInt(record.endTime.split(":")[0], 10);
        const hours = end - start;

        if (existing) {
          existing.totalDays += 1;
          existing.totalHours += hours;
        } else {
          summaryMap.set(record.girlId, {
            girlName: record.girlName,
            totalDays: 1,
            totalHours: hours,
          });
        }
      }
    });

    return Array.from(summaryMap.entries())
      .map(([girlId, data]) => ({
        girlId,
        ...data,
      }))
      .sort((a, b) => b.totalDays - a.totalDays);
  }, [year, month]);

  // 日別の出勤人数集計
  const dailySummaries = useMemo((): DailyAttendanceSummary[] => {
    const summaryMap = new Map<
      string,
      { dayOfWeek: number; headcount: number; girlNames: string[] }
    >();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // まず全日付を初期化
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayOfWeek = new Date(year, month, day).getDay();
      summaryMap.set(date, { dayOfWeek, headcount: 0, girlNames: [] });
    }

    // 出勤データを集計
    attendanceRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      if (
        recordDate.getFullYear() === year &&
        recordDate.getMonth() === month
      ) {
        const existing = summaryMap.get(record.date);
        if (existing) {
          existing.headcount += 1;
          existing.girlNames.push(record.girlName);
        }
      }
    });

    return Array.from(summaryMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [year, month]);

  // 月間合計
  const monthlyTotals = useMemo(() => {
    const totalDays = girlMonthlySummaries.reduce(
      (sum, g) => sum + g.totalDays,
      0
    );
    const totalHours = girlMonthlySummaries.reduce(
      (sum, g) => sum + g.totalHours,
      0
    );
    const avgHeadcount =
      dailySummaries.length > 0
        ? Math.round(
            (dailySummaries.reduce((sum, d) => sum + d.headcount, 0) /
              dailySummaries.length) *
              10
          ) / 10
        : 0;

    return { totalDays, totalHours, avgHeadcount };
  }, [girlMonthlySummaries, dailySummaries]);

  return (
    <div className="space-y-6">
      {/* ヘッダー：月選択 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">出勤集計</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center font-medium">
            {year}年 {month + 1}月
          </span>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 月間サマリーカード */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              月間総出勤数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{monthlyTotals.totalDays}回</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              月間総勤務時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{monthlyTotals.totalHours}時間</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均出勤人数/日
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{monthlyTotals.avgHeadcount}人</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 女の子ごとの月間出勤数 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              女の子別 月間出勤数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead className="text-right">出勤日数</TableHead>
                    <TableHead className="text-right">勤務時間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {girlMonthlySummaries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-muted-foreground"
                      >
                        データがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    girlMonthlySummaries.map((summary) => (
                      <TableRow key={summary.girlId}>
                        <TableCell className="font-medium">
                          {summary.girlName}
                        </TableCell>
                        <TableCell className="text-right">
                          {summary.totalDays}日
                        </TableCell>
                        <TableCell className="text-right">
                          {summary.totalHours}時間
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 日別出勤人数サマリー */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              日別 出勤人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>曜日</TableHead>
                    <TableHead className="text-right">出勤人数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySummaries.map((summary) => (
                    <TableRow
                      key={summary.date}
                      className={
                        summary.dayOfWeek === 0 || summary.dayOfWeek === 6
                          ? "bg-gray-50"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {new Date(summary.date).getDate()}日
                      </TableCell>
                      <TableCell
                        className={
                          summary.dayOfWeek === 0
                            ? "text-red-500"
                            : summary.dayOfWeek === 6
                              ? "text-blue-500"
                              : ""
                        }
                      >
                        {WEEKDAYS[summary.dayOfWeek]}
                      </TableCell>
                      <TableCell className="text-right">
                        {summary.headcount}人
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
