"use client";

import { useMemo } from "react";
import { Camera, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PhotoDiaryEntry, DailyStats } from "./types";

interface PhotoDiaryCheckProps {
  entries: PhotoDiaryEntry[];
  onToggle: (id: string, field: "post1" | "post2" | "post3") => void;
  date: string;
}

export function PhotoDiaryCheck({
  entries,
  onToggle,
  date,
}: PhotoDiaryCheckProps) {
  // 統計計算
  const stats: DailyStats = useMemo(() => {
    const total = entries.length;
    const post1Count = entries.filter((e) => e.post1).length;
    const post2Count = entries.filter((e) => e.post2).length;
    const post3Count = entries.filter((e) => e.post3).length;

    // 達成率 = (完了チェック数 / 全チェック数) * 100
    const totalChecks = total * 3;
    const completedChecks = post1Count + post2Count + post3Count;
    const achievementRate =
      totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

    return { total, post1Count, post2Count, post3Count, achievementRate };
  }, [entries]);

  // 個人の達成率計算
  const getPersonalRate = (entry: PhotoDiaryEntry) => {
    const completed = [entry.post1, entry.post2, entry.post3].filter(Boolean).length;
    return Math.round((completed / 3) * 100);
  };

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              出勤者数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}人</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              1本目完了
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {stats.post1Count}/{stats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              2本目完了
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {stats.post2Count}/{stats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              3本目完了
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-pink-600">
              {stats.post3Count}/{stats.total}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              全体達成率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats.achievementRate}%
            </p>
            <Progress value={stats.achievementRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* チェックリスト */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            写メ日記チェック - {date}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">名前</TableHead>
                  <TableHead className="text-center w-[120px]">1本目</TableHead>
                  <TableHead className="text-center w-[120px]">2本目</TableHead>
                  <TableHead className="text-center w-[120px]">3本目</TableHead>
                  <TableHead className="text-center w-[100px]">達成率</TableHead>
                  <TableHead>メモ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      本日の出勤者はいません
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => {
                    const personalRate = getPersonalRate(entry);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.girlName}
                        </TableCell>
                        <TableCell className="text-center">
                          <CheckButton
                            checked={entry.post1}
                            onClick={() => onToggle(entry.id, "post1")}
                            colorClass="bg-blue-500 hover:bg-blue-600"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <CheckButton
                            checked={entry.post2}
                            onClick={() => onToggle(entry.id, "post2")}
                            colorClass="bg-purple-500 hover:bg-purple-600"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <CheckButton
                            checked={entry.post3}
                            onClick={() => onToggle(entry.id, "post3")}
                            colorClass="bg-pink-500 hover:bg-pink-600"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={cn(
                                "font-bold",
                                personalRate === 100
                                  ? "text-green-600"
                                  : personalRate >= 66
                                    ? "text-amber-600"
                                    : "text-gray-500"
                              )}
                            >
                              {personalRate}%
                            </span>
                            <Progress
                              value={personalRate}
                              className="h-1.5 w-16"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {entry.note || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// チェックボタンコンポーネント
function CheckButton({
  checked,
  onClick,
  colorClass,
}: {
  checked: boolean;
  onClick: () => void;
  colorClass: string;
}) {
  return (
    <Button
      variant={checked ? "default" : "outline"}
      size="lg"
      className={cn(
        "h-10 w-10 p-0 transition-all",
        checked ? colorClass + " text-white" : "hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      {checked ? (
        <Check className="h-5 w-5" />
      ) : (
        <X className="h-5 w-5 text-gray-400" />
      )}
    </Button>
  );
}
