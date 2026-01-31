"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Users,
  Calendar,
  MessageSquare,
  Camera,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Eye,
  CalendarClock,
  Layout,
  CheckCircle,
  Target,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTodos } from "@/hooks/useTodos";
import { useGirls } from "@/hooks/useGirls";
import { useContacts } from "@/hooks/useContacts";
import { useDailyCheck } from "@/hooks/useDailyCheck";
import { useCityHeaven } from "@/hooks/useCityHeaven";
import { useReminders } from "@/hooks/useReminders";
import { useEvents } from "@/hooks/useEvents";
import { useAttendanceTargets, DayType, isEventDay } from "@/hooks/useAttendanceTargets";
import { useScrapedPhotoDiary } from "@/hooks/useScrapedPhotoDiary";
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { NoticeBoard } from "@/components/notice-board";
import { ConsultationChat } from "@/components/consultation-chat";

export default function DashboardPage() {
  const { stats: todoStats } = useTodos();
  const { girls } = useGirls();
  const { contacts } = useContacts();
  const { stats: dailyStats } = useDailyCheck();
  const { stats: cityHeavenStats, isLoading: cityHeavenLoading } = useCityHeaven();
  const { reminders, isLoading: remindersLoading, confirmReview, getMonthName } = useReminders();
  const { events } = useEvents();
  const {
    targets,
    isLoading: targetsLoading,
    updateTargets,
    getDayType,
    getTargetForDayType,
    getDayTypeLabel,
    calculateAchievementRate,
    getAchievementColor,
    getProgressColor,
  } = useAttendanceTargets();

  // スクレイピングデータから出勤情報と写メ日記情報を取得
  const { data: scrapedData, stats: scrapedPhotoStats } = useScrapedPhotoDiary();
  const scrapedAttendance = useMemo(() => scrapedData?.attendance || [], [scrapedData]);

  // 目標設定モーダル用state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editTargets, setEditTargets] = useState({
    weekdayTarget: targets.weekdayTarget,
    weekendTarget: targets.weekendTarget,
    eventTarget: targets.eventTarget,
    nightTarget: targets.nightTarget,
  });

  // モーダルを開いたときに現在の値をセット
  const handleOpenModal = () => {
    setEditTargets({
      weekdayTarget: targets.weekdayTarget,
      weekendTarget: targets.weekendTarget,
      eventTarget: targets.eventTarget,
      nightTarget: targets.nightTarget,
    });
    setIsTargetModalOpen(true);
  };

  // 目標設定を保存
  const handleSaveTargets = async () => {
    const success = await updateTargets(editTargets);
    if (success) {
      setIsTargetModalOpen(false);
    }
  };

  // 今日の日付を取得
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayDate = useMemo(() => new Date(), []);

  // 今日がイベント日かどうか判定（外部イベント）
  const hasExternalEvent = useMemo(() => {
    return events.some((event) => {
      if (event.status === "completed") return false;
      return event.startDate <= today && event.endDate >= today;
    });
  }, [events, today]);

  // 今日がイベント日かどうか（外部イベント or 末尾2/8の日）
  const hasTodayEvent = useMemo(() => {
    return hasExternalEvent || isEventDay(todayDate);
  }, [hasExternalEvent, todayDate]);

  // 今日の日付タイプを取得
  const todayDayType: DayType = useMemo(() => {
    return getDayType(todayDate, hasTodayEvent);
  }, [getDayType, todayDate, hasTodayEvent]);

  // 今日の目標人数
  const todayTarget = useMemo(() => {
    return getTargetForDayType(todayDayType);
  }, [getTargetForDayType, todayDayType]);

  // スクレイピングデータから出勤確定数を取得
  const confirmedCount = useMemo(() => {
    return scrapedAttendance.length;
  }, [scrapedAttendance]);

  // 夜間出勤者数（24時以降＝0〜5時に勤務している人数）
  // 終了時刻が0:00〜5:00の場合を夜間出勤とみなす
  const nightShiftCount = useMemo(() => {
    return scrapedAttendance.filter((a) => {
      const hour = parseInt(a.endTime?.split(':')[0] || '0');
      return hour >= 0 && hour <= 5;
    }).length;
  }, [scrapedAttendance]);

  // 夜間出勤目標
  const nightTarget = targets.nightTarget;

  // 夜間出勤達成率
  const nightAchievementRate = useMemo(() => {
    return calculateAchievementRate(nightShiftCount, nightTarget);
  }, [calculateAchievementRate, nightShiftCount, nightTarget]);

  // 夜間出勤達成率の色
  const nightAchievementColor = useMemo(() => {
    return getAchievementColor(nightAchievementRate);
  }, [getAchievementColor, nightAchievementRate]);

  // 夜間出勤プログレスバーの色
  const nightProgressColorClass = useMemo(() => {
    return getProgressColor(nightAchievementRate);
  }, [getProgressColor, nightAchievementRate]);

  // 達成率を計算
  const achievementRate = useMemo(() => {
    return calculateAchievementRate(confirmedCount, todayTarget);
  }, [calculateAchievementRate, confirmedCount, todayTarget]);

  // 達成率の色
  const achievementColor = useMemo(() => {
    return getAchievementColor(achievementRate);
  }, [getAchievementColor, achievementRate]);

  // プログレスバーの色
  const progressColorClass = useMemo(() => {
    return getProgressColor(achievementRate);
  }, [getProgressColor, achievementRate]);

  const dashboardCards = [
    {
      title: "やることリスト",
      href: "/todos",
      icon: CheckSquare,
      value: todoStats.pending + todoStats.inProgress,
      label: "未完了タスク",
      subValue: `完了率 ${todoStats.completionRate}%`,
      color: todoStats.highPriority > 0 ? "text-orange-500" : "text-blue-500",
      alert: todoStats.highPriority > 0,
      alertLabel: `高優先度 ${todoStats.highPriority}件`,
    },
    {
      title: "女の子マスタ",
      href: "/girls",
      icon: Users,
      value: girls.length,
      label: "登録済み",
      subValue: `レギュラー ${girls.filter((g) => g.tag === "レギュラー").length}名`,
      color: "text-pink-500",
    },
    {
      title: "本日の出勤",
      href: "/attendance",
      icon: Calendar,
      value: confirmedCount,
      label: "出勤確定",
      subValue: `夜間 ${nightShiftCount}名`,
      color: "text-green-500",
    },
    {
      title: "声かけリスト",
      href: "/contacts",
      icon: MessageSquare,
      value: contacts.filter(
        (c) => c.status === "not_contacted" || c.status === "contacted" || c.status === "interested"
      ).length,
      label: "対応中",
      subValue: `総数 ${contacts.length}件`,
      color: "text-purple-500",
    },
    {
      title: "日次チェック",
      href: "/daily-check",
      icon: ClipboardCheck,
      value: `${dailyStats.percentage}%`,
      label: "本日の進捗",
      subValue: `${dailyStats.completed}/${dailyStats.total} 完了`,
      color:
        dailyStats.percentage === 100 ? "text-green-500" : "text-yellow-500",
      progress: dailyStats.percentage,
    },
    {
      title: "写メ日記",
      href: "/photo-diary",
      icon: Camera,
      value: scrapedPhotoStats ? `${scrapedPhotoStats.complete}/${scrapedPhotoStats.total}` : "-/-",
      label: "3件達成",
      subValue: scrapedPhotoStats ? `本日投稿 ${scrapedPhotoStats.todayPostCount}件` : "データ取得中",
      color: scrapedPhotoStats?.percentage === 100 ? "text-green-500" : "text-blue-500",
      progress: scrapedPhotoStats?.percentage ?? 0,
    },
    {
      title: "シティヘブン",
      href: "/cityheaven",
      icon: Eye,
      value: cityHeavenLoading
        ? "..."
        : cityHeavenStats?.publishedCount?.toLocaleString() ?? "-",
      label: "掲載人数",
      subValue: cityHeavenStats
        ? `非掲載 ${cityHeavenStats.nonPublishedCount?.toLocaleString() ?? "-"}名`
        : "データ取得中",
      color: "text-cyan-500",
    },
  ];

  // リマインダー表示条件
  const showReminders = !remindersLoading && reminders && (reminders.eventReviewDue || reminders.panelReviewDue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">本日の業務状況を確認できます</p>
      </div>

      {/* 連絡事項 */}
      <NoticeBoard />

      {/* 相談口（AI アシスタント） */}
      <ConsultationChat />

      {/* 本日の出勤状況カード */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              本日の出勤状況（{getDayTypeLabel(todayDayType)}）
            </CardTitle>
            {hasTodayEvent && (
              <Badge className="bg-purple-500 text-white">
                イベント開催中
              </Badge>
            )}
          </div>
          <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenModal}
                className="gap-1"
              >
                <Settings className="h-4 w-4" />
                目標設定
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>出勤目標設定</DialogTitle>
                <DialogDescription>
                  各日タイプごとの出勤目標人数を設定します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="weekdayTarget">平日の目標人数</Label>
                  <Input
                    id="weekdayTarget"
                    type="number"
                    min="0"
                    value={editTargets.weekdayTarget}
                    onChange={(e) =>
                      setEditTargets({
                        ...editTargets,
                        weekdayTarget: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekendTarget">土日祝の目標人数</Label>
                  <Input
                    id="weekendTarget"
                    type="number"
                    min="0"
                    value={editTargets.weekendTarget}
                    onChange={(e) =>
                      setEditTargets({
                        ...editTargets,
                        weekendTarget: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTarget">イベント日の目標人数</Label>
                  <p className="text-xs text-muted-foreground">
                    末尾2/8の日（2日, 8日, 12日, 18日, 22日, 28日）
                  </p>
                  <Input
                    id="eventTarget"
                    type="number"
                    min="0"
                    value={editTargets.eventTarget}
                    onChange={(e) =>
                      setEditTargets({
                        ...editTargets,
                        eventTarget: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nightTarget">夜間出勤の目標人数</Label>
                  <p className="text-xs text-muted-foreground">
                    24時〜翌5時に勤務する人数
                  </p>
                  <Input
                    id="nightTarget"
                    type="number"
                    min="0"
                    value={editTargets.nightTarget}
                    onChange={(e) =>
                      setEditTargets({
                        ...editTargets,
                        nightTarget: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsTargetModalOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleSaveTargets} disabled={targetsLoading}>
                  {targetsLoading ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">目標</p>
              <p className="text-3xl font-bold">{todayTarget}人</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">現在</p>
              <p className="text-3xl font-bold text-blue-500">{confirmedCount}人</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">達成率</p>
              <div className="flex items-center justify-center gap-2">
                <p className={`text-3xl font-bold ${achievementColor}`}>
                  {achievementRate}%
                </p>
                {achievementRate >= 100 && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">進捗</span>
              <span className={achievementColor}>
                {confirmedCount} / {todayTarget}人
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-primary/20">
              <div
                className={`h-full transition-all ${progressColorClass}`}
                style={{ width: `${Math.min(achievementRate, 100)}%` }}
              />
            </div>
            {achievementRate > 100 && (
              <p className="text-sm text-green-500 mt-2 text-center">
                目標を{achievementRate - 100}%超過達成しています
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 夜間出勤状況カード */}
      <Card className="border-2 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg font-semibold">
              夜間出勤（24時〜）
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">目標</p>
              <p className="text-3xl font-bold">{nightTarget}人</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">現在</p>
              <p className="text-3xl font-bold text-indigo-500">{nightShiftCount}人</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">達成率</p>
              <div className="flex items-center justify-center gap-2">
                <p className={`text-3xl font-bold ${nightAchievementColor}`}>
                  {nightAchievementRate}%
                </p>
                {nightAchievementRate >= 100 && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">進捗</span>
              <span className={nightAchievementColor}>
                {nightShiftCount} / {nightTarget}人
              </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-primary/20">
              <div
                className={`h-full transition-all ${nightProgressColorClass}`}
                style={{ width: `${Math.min(nightAchievementRate, 100)}%` }}
              />
            </div>
            {nightAchievementRate > 100 && (
              <p className="text-sm text-green-500 mt-2 text-center">
                目標を{nightAchievementRate - 100}%超過達成しています
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3ヶ月レビューリマインダー */}
      {showReminders && (
        <div className="grid gap-4 md:grid-cols-2">
          {reminders.eventReviewDue && (
            <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    イベント見直しリマインダー
                  </CardTitle>
                </div>
                <Badge variant="outline" className="border-orange-400 text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  要確認
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                  イベントを見直す時期です（前回: {getMonthName(reminders.lastEventReview)}）
                </p>
                <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mb-4">
                  3ヶ月ごとにイベント内容を確認し、最新の状態に保ちましょう。
                </p>
                <div className="flex gap-2">
                  <Link href="/events">
                    <Button variant="outline" size="sm" className="border-orange-400 text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/40">
                      <Calendar className="h-4 w-4 mr-1" />
                      イベント管理へ
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => confirmReview("event")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    確認済み
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {reminders.panelReviewDue && (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    パネル見直しリマインダー
                  </CardTitle>
                </div>
                <Badge variant="outline" className="border-amber-400 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  要確認
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  パネルを見直す時期です（前回: {getMonthName(reminders.lastPanelReview)}）
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mb-4">
                  3ヶ月ごとにパネル内容を確認し、効果的な表示を維持しましょう。
                </p>
                <div className="flex gap-2">
                  <Link href="/girls">
                    <Button variant="outline" size="sm" className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40">
                      <Users className="h-4 w-4 mr-1" />
                      パネル管理へ
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => confirmReview("panel")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    確認済み
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 出勤カレンダー */}
      <AttendanceCalendar />

      {/* メインカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${card.color}`}>
                      {card.value}
                    </span>
                    {card.alert && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {card.alertLabel}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  {card.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={card.progress} className="h-2" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subValue}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* サマリーカード */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>本日のサマリー</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">
                {dailyStats.percentage}%
              </p>
              <p className="text-sm text-muted-foreground">日次チェック進捗</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className={`text-2xl font-bold ${achievementColor}`}>
                {achievementRate}%
              </p>
              <p className="text-sm text-muted-foreground">出勤目標達成率</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-500">
                {scrapedPhotoStats?.percentage ?? 0}%
              </p>
              <p className="text-sm text-muted-foreground">写メ日記達成率</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-orange-500">
                {todoStats.highPriority}
              </p>
              <p className="text-sm text-muted-foreground">要対応タスク</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
