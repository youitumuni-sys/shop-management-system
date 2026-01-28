"use client";

import { useState, useMemo } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useScrapedPhotoDiary } from "@/hooks/useScrapedPhotoDiary";

type SortField = "time" | "status" | "name" | "postCount";
type SortDirection = "asc" | "desc";

const STATUS_ORDER = { none: 0, partial: 1, complete: 2 };

export default function PhotoDiaryPage() {
  const { data, stats, isLoading, error, lastFetched, runScraping } =
    useScrapedPhotoDiary();

  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleScrape = async () => {
    await runScraping();
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "-";
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseTime = (timeStr?: string): number => {
    if (!timeStr) return 9999;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedResults = useMemo(() => {
    if (!data?.checkResults) return [];

    return [...data.checkResults].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "time":
          comparison = parseTime(a.startTime) - parseTime(b.startTime);
          break;
        case "status":
          comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case "name":
          comparison = a.name.localeCompare(b.name, "ja");
          break;
        case "postCount":
          comparison = a.postCount - b.postCount;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data?.checkResults, sortField, sortDirection]);

  const getStatusIcon = (status: "complete" | "partial" | "none") => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "none":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: "complete" | "partial" | "none") => {
    switch (status) {
      case "complete":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">3本完了</Badge>
        );
      case "partial":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">一部</Badge>;
      case "none":
        return <Badge variant="destructive">未投稿</Badge>;
    }
  };

  const getRowClassName = (status: "complete" | "partial" | "none") => {
    switch (status) {
      case "complete":
        return "bg-green-50 dark:bg-green-950/30";
      case "partial":
        return "bg-yellow-50 dark:bg-yellow-950/30";
      case "none":
        return "bg-red-50 dark:bg-red-950/30";
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">写メ日記チェック</h1>
          <p className="text-muted-foreground">
            出勤者の写メ日記投稿状況を自動チェックします
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastFetched && (
            <span className="text-sm text-muted-foreground">
              最終更新: {formatTime(lastFetched)}
            </span>
          )}
          <Button onClick={handleScrape} disabled={isLoading}>
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            {isLoading ? "チェック中..." : "今すぐチェック"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
          <CardContent className="pt-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 統計カード */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {/* 本日の投稿数カード */}
          <Card className={cn(
            "col-span-1 md:col-span-1 lg:col-span-2",
            stats.isTargetAchieved
              ? "border-green-500 bg-green-50 dark:bg-green-950/30"
              : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                本日の投稿数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-3xl font-bold",
                  stats.isTargetAchieved ? "text-green-600" : "text-yellow-600"
                )}>
                  {stats.todayPostCount}
                </span>
                <span className="text-muted-foreground">件</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                {stats.isTargetAchieved ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    目標達成
                  </Badge>
                ) : (
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    目標: {stats.targetPostCount}件 / 現在: {stats.todayPostCount}件
                  </span>
                )}
              </div>
              <div className="mt-2">
                <Progress
                  value={Math.min(stats.targetAchievementRate, 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  達成率: {stats.targetAchievementRate}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                出勤者数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}名</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                3本完了
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.complete}名
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                一部完了
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.partial}名
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                未投稿
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.none}名
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 進捗バー */}
      {stats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">全体進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={stats.percentage} className="flex-1" />
              <span className="text-lg font-bold min-w-[60px] text-right">
                {stats.percentage}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 出勤者一覧テーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>出勤者一覧</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={sortField === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("status")}
              >
                ステータス順
                <SortIcon field="status" />
              </Button>
              <Button
                variant={sortField === "time" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("time")}
              >
                時間順
                <SortIcon field="time" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !data ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>データを読み込み中...</p>
            </div>
          ) : !data || data.checkResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>データがありません</p>
              <p className="text-sm mt-2">
                「今すぐチェック」ボタンでスクレイピングを実行してください
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">状態</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        名前
                        <SortIcon field="name" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("time")}
                    >
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        出勤時間
                        <SortIcon field="time" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("postCount")}
                    >
                      <div className="flex items-center">
                        投稿数
                        <SortIcon field="postCount" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        ステータス
                        <SortIcon field="status" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map((result, index) => (
                    <TableRow
                      key={index}
                      className={getRowClassName(result.status)}
                    >
                      <TableCell>
                        {getStatusIcon(result.status)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {result.name}
                      </TableCell>
                      <TableCell>
                        {result.startTime && result.endTime ? (
                          <span className="font-mono text-sm">
                            {result.startTime} - {result.endTime}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {result.postCount}
                        </span>
                        <span className="text-muted-foreground">本</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(result.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* スケジュール情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            自動チェックスケジュール
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            毎日 9:00, 12:00, 15:00, 18:00, 21:00, 0:00 に自動実行
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
