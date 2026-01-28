"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AttendanceCalendar,
} from "@/components/features/attendance";
import { useScrapedPhotoDiary, PhotoDiaryCheckResult } from "@/hooks/useScrapedPhotoDiary";

// 写メ日記投稿状況の表示コンポーネント
function PhotoDiaryStatus({ result }: { result: PhotoDiaryCheckResult }) {
  const statusColor = {
    complete: "bg-green-100 text-green-800",
    partial: "bg-amber-100 text-amber-800",
    none: "bg-red-100 text-red-800",
  };

  const statusLabel = {
    complete: "投稿済",
    partial: "一部投稿",
    none: "未投稿",
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={statusColor[result.status]}>
        {statusLabel[result.status]}
      </Badge>
      {result.postCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({result.postCount}件)
        </span>
      )}
    </div>
  );
}

// 出勤者カードコンポーネント
function AttendanceCard({ result }: { result: PhotoDiaryCheckResult }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 bg-white">
      {/* 出勤ステータス */}
      <div className="flex items-center gap-2">
        {result.isWorking ? (
          <Badge className="bg-green-500 text-white text-lg px-3 py-1">
            出勤
          </Badge>
        ) : (
          <Badge className="bg-gray-300 text-gray-600 text-lg px-3 py-1">
            休み
          </Badge>
        )}
      </div>

      {/* 名前 */}
      <div className="w-32 font-medium text-lg">{result.name}</div>

      {/* 出勤時間 */}
      {result.isWorking && result.startTime && result.endTime && (
        <div className="flex items-center gap-2 text-base">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {result.startTime}
          </span>
          <span className="text-muted-foreground">〜</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {result.endTime}
          </span>
        </div>
      )}

      {/* 写メ日記投稿状況 */}
      <div className="ml-auto">
        <PhotoDiaryStatus result={result} />
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const { data, stats, isLoading, error, lastFetched, runScraping } = useScrapedPhotoDiary();

  // 日付変更
  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    const newDate = date.toISOString().split("T")[0];
    setSelectedDate(newDate);
  };

  // 今日の日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
  };

  // 出勤中のキャストをフィルタリング
  const workingCasts = data?.checkResults.filter((r) => r.isWorking) || [];
  const notWorkingCasts = data?.checkResults.filter((r) => !r.isWorking) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">出勤管理</h1>
        <p className="text-muted-foreground">
          Spark Scheduleから取得した出勤情報を表示します
        </p>
      </div>

      {/* 日付ナビゲーションとデータ取得ボタン */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="icon" onClick={() => handleDateChange(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold min-w-[200px] text-center">
          {formatDate(selectedDate)}
        </div>
        <Button variant="outline" size="icon" onClick={() => handleDateChange(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const today = new Date().toISOString().split("T")[0];
            setSelectedDate(today);
          }}
        >
          今日
        </Button>

        <div className="ml-auto flex items-center gap-4">
          {lastFetched && (
            <span className="text-sm text-muted-foreground">
              最終取得: {lastFetched.toLocaleTimeString("ja-JP")}
            </span>
          )}
          <Button
            onClick={runScraping}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            データ取得
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{workingCasts.length}</div>
              <div className="text-sm text-muted-foreground">出勤中</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
              <div className="text-sm text-muted-foreground">写メ日記投稿済</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-600">{stats.partial}</div>
              <div className="text-sm text-muted-foreground">一部投稿</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{stats.none}</div>
              <div className="text-sm text-muted-foreground">未投稿</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && !data && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">データを取得中...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 出勤者リスト */}
      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>出勤中のキャスト ({workingCasts.length}名)</span>
                {data.scrapedAt && (
                  <span className="text-sm font-normal text-muted-foreground">
                    スクレイピング日時: {new Date(data.scrapedAt).toLocaleString("ja-JP")}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workingCasts.map((result) => (
                  <AttendanceCard key={result.name} result={result} />
                ))}
                {workingCasts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    出勤中のキャストはいません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 休みのキャスト */}
          {notWorkingCasts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>本日休みのキャスト ({notWorkingCasts.length}名)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notWorkingCasts.map((result) => (
                    <AttendanceCard key={result.name} result={result} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* データがない場合 */}
      {!isLoading && !data && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">
                出勤データがありません。「データ取得」ボタンをクリックして最新情報を取得してください。
              </p>
              <Button onClick={runScraping}>
                <RefreshCw className="h-4 w-4 mr-2" />
                データ取得
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* カレンダー表示 */}
      <AttendanceCalendar
        todayAttendance={data?.checkResults}
        scrapedAt={data?.scrapedAt}
      />
    </div>
  );
}
