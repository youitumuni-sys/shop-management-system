"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Users, Eye, TrendingUp, BookOpen, ArrowUp, ArrowDown, ArrowUpDown, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCityHeaven, GirlAccessStats } from "@/hooks/useCityHeaven";

type SortKey = "access" | "change" | "name" | "diary";
type SortOrder = "asc" | "desc";

export default function CityHeavenPage() {
  const { girls, stats, accessStats, todayDiaryCountMap, isLoading, error, lastFetched, runScraping } =
    useCityHeaven();

  // 本日の日記投稿数マップをメモ化
  const diaryCountMap = useMemo(() => todayDiaryCountMap(), [todayDiaryCountMap]);
  const [sortKey, setSortKey] = useState<SortKey>("access");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // アクセス統計をマップに変換
  const accessStatsMap = new Map<string, GirlAccessStats>();
  if (accessStats?.girls) {
    accessStats.girls.forEach((stat) => {
      accessStatsMap.set(stat.name, stat);
    });
  }

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

  // ソート切り替え
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  // 女の子ごとの日記投稿数を取得するヘルパー関数
  const getDiaryCount = (name: string): number => {
    // 完全一致で検索
    if (diaryCountMap.has(name)) {
      return diaryCountMap.get(name) || 0;
    }
    // 部分一致で検索
    const entries = Array.from(diaryCountMap.entries());
    for (let i = 0; i < entries.length; i++) {
      const [diaryName, count] = entries[i];
      if (diaryName.includes(name) || name.includes(diaryName)) {
        return count;
      }
    }
    return 0;
  };

  // ソート処理
  const sortedGirls = [...girls].sort((a, b) => {
    const statA = accessStatsMap.get(a.name);
    const statB = accessStatsMap.get(b.name);
    const diaryA = getDiaryCount(a.name);
    const diaryB = getDiaryCount(b.name);

    let comparison = 0;
    switch (sortKey) {
      case "access":
        comparison = (statB?.monthlyTotal || 0) - (statA?.monthlyTotal || 0);
        break;
      case "change":
        comparison = (statB?.change || 0) - (statA?.change || 0);
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "diary":
        comparison = diaryB - diaryA;
        break;
    }
    return sortOrder === "desc" ? comparison : -comparison;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            シティヘブン アクセス情報
          </h1>
          <p className="text-muted-foreground">
            シティヘブン管理画面から女の子のアクセス情報を取得します
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
            {isLoading ? "取得中..." : "データ取得"}
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                在籍数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGirls}名</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                掲載人数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {stats.publishedCount?.toLocaleString() ?? 0}名
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                非掲載人数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.nonPublishedCount?.toLocaleString() ?? 0}名
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 女の子一覧（アクセス順） */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              アクセスランキング
              {accessStats && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({accessStats.year}年{accessStats.month}月)
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={sortKey === "access" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("access")}
              >
                <Eye className="h-4 w-4 mr-1" />
                今月
                {sortKey === "access" && (
                  sortOrder === "desc" ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant={sortKey === "change" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("change")}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                増減
                {sortKey === "change" && (
                  sortOrder === "desc" ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant={sortKey === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("name")}
              >
                名前
                {sortKey === "name" && (
                  sortOrder === "desc" ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant={sortKey === "diary" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("diary")}
              >
                <Camera className="h-4 w-4 mr-1" />
                日記
                {sortKey === "diary" && (
                  sortOrder === "desc" ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedGirls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>データがありません</p>
              <p className="text-sm mt-2">
                「データ取得」ボタンでシティヘブンから情報を取得してください
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedGirls.map((girl, index) => {
                const girlStats = accessStatsMap.get(girl.name);
                const isTopRank = sortKey === "access" && index < 3;
                const change = girlStats?.change || 0;
                const todayDiaryCount = getDiaryCount(girl.name);

                return (
                  <div
                    key={girl.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isTopRank && "bg-yellow-50 dark:bg-yellow-950/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          isTopRank && index === 0 && "bg-yellow-400 text-yellow-900",
                          isTopRank && index === 1 && "bg-gray-300 text-gray-700",
                          isTopRank && index === 2 && "bg-amber-600 text-amber-100",
                          !isTopRank && "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{girl.name}</p>
                        {girl.age && (
                          <p className="text-sm text-muted-foreground">
                            {girl.age}歳
                            {girl.height && ` / ${girl.height}cm`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {(girlStats?.monthlyTotal || 0).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">今月</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <div className="flex items-center gap-1 justify-end">
                          {change > 0 ? (
                            <>
                              <ArrowUp className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-green-500">
                                +{change.toLocaleString()}
                              </span>
                            </>
                          ) : change < 0 ? (
                            <>
                              <ArrowDown className="h-4 w-4 text-red-500" />
                              <span className="font-medium text-red-500">
                                {change.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium text-muted-foreground">
                              0
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">先月比</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <div className="flex items-center gap-1 justify-end">
                          <Camera className={cn(
                            "h-4 w-4",
                            todayDiaryCount >= 3 && "text-green-500",
                            todayDiaryCount === 0 && "text-red-500",
                            todayDiaryCount > 0 && todayDiaryCount < 3 && "text-yellow-500"
                          )} />
                          <span className={cn(
                            "font-medium",
                            todayDiaryCount >= 3 && "text-green-500",
                            todayDiaryCount === 0 && "text-red-500",
                            todayDiaryCount > 0 && todayDiaryCount < 3 && "text-yellow-500"
                          )}>
                            {todayDiaryCount}件
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">本日日記</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{girl.diaryCount || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">総日記</p>
                      </div>
                      {isTopRank && (
                        <Badge
                          className={cn(
                            index === 0 && "bg-yellow-400 text-yellow-900",
                            index === 1 && "bg-gray-400 text-gray-900",
                            index === 2 && "bg-amber-600 text-amber-100"
                          )}
                        >
                          {index === 0 && "1位"}
                          {index === 1 && "2位"}
                          {index === 2 && "3位"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
