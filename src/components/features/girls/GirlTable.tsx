"use client";

import { useState } from "react";
import { Pencil, Trash2, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Girl, GirlTag, needsInterview } from "./types";

interface GirlTableProps {
  girls: Girl[];
  onEdit: (girl: Girl) => void;
  onDelete: (id: string) => void;
}

function getTagBadgeVariant(tag: string): "default" | "secondary" | "destructive" | "outline" {
  switch (tag) {
    case GirlTag.REGULAR:
      return "default";
    case GirlTag.RARE:
      return "secondary";
    case GirlTag.RETIRED:
      return "destructive";
    case GirlTag.DUMMY:
      return "outline";
    default:
      return "outline";
  }
}

function getTagBadgeClass(tag: string): string {
  switch (tag) {
    case GirlTag.REGULAR:
      return "bg-green-600 hover:bg-green-600/80";
    case GirlTag.RARE:
      return "bg-amber-500 hover:bg-amber-500/80";
    case GirlTag.RETIRED:
      return "bg-gray-500 hover:bg-gray-500/80";
    case GirlTag.DUMMY:
      return "bg-slate-400 hover:bg-slate-400/80 text-slate-700";
    default:
      return "";
  }
}

// 備考のプレビュー（最初の30文字 + ...）
function getNotePreview(note: string, maxLength: number = 30): string {
  if (!note) return "-";
  const firstLine = note.split("\n")[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength) + "...";
}

// 日付のフォーマット
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function GirlTable({ girls, onEdit, onDelete }: GirlTableProps) {
  const [selectedGirl, setSelectedGirl] = useState<Girl | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetail = (girl: Girl) => {
    setSelectedGirl(girl);
    setIsDetailOpen(true);
  };

  const handleEditFromDetail = () => {
    if (selectedGirl) {
      setIsDetailOpen(false);
      onEdit(selectedGirl);
    }
  };

  // 直近1ヶ月の出勤日数を計算
  const getRecentAttendanceCount = (attendanceDates: string[]): number => {
    const oneMonthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    return attendanceDates.filter(dateStr => new Date(dateStr) >= oneMonthAgo).length;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>タグ</TableHead>
              <TableHead>面談</TableHead>
              <TableHead>最終出勤日</TableHead>
              <TableHead className="min-w-[200px]">備考</TableHead>
              <TableHead className="w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {girls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              girls.map((girl) => {
                const interviewRequired = needsInterview(girl.lastInterviewDate);
                return (
                  <TableRow key={girl.id}>
                    <TableCell className="font-medium">{girl.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getTagBadgeVariant(girl.tag)}
                        className={getTagBadgeClass(girl.tag)}
                      >
                        {girl.tag}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {girl.interviewed ? (
                        interviewRequired ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">要面談</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">済</span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">未面談</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {girl.lastAttendance ? formatDate(girl.lastAttendance) : "-"}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <span className="text-sm text-muted-foreground">
                        {getNotePreview(girl.note)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(girl)}
                          title="詳細を見る"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(girl)}
                          title="編集"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(girl.id)}
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 詳細表示ダイアログ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedGirl?.name} の詳細</span>
            </DialogTitle>
          </DialogHeader>
          {selectedGirl && (
            <div className="space-y-4">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">タグ</p>
                  <Badge
                    variant={getTagBadgeVariant(selectedGirl.tag)}
                    className={getTagBadgeClass(selectedGirl.tag)}
                  >
                    {selectedGirl.tag}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">面談状況</p>
                  {selectedGirl.interviewed ? (
                    needsInterview(selectedGirl.lastInterviewDate) ? (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">要面談（最終: {formatDate(selectedGirl.lastInterviewDate)}）</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">済（最終: {formatDate(selectedGirl.lastInterviewDate)}）</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">未面談</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 出勤情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">最終出勤日</p>
                  <p className="text-sm">{selectedGirl.lastAttendance ? formatDate(selectedGirl.lastAttendance) : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">直近1ヶ月の出勤日数</p>
                  <p className="text-sm">{getRecentAttendanceCount(selectedGirl.attendanceDates)}日</p>
                </div>
              </div>

              {/* 日時情報 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">登録日</p>
                  <p>{formatDateTime(selectedGirl.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">最終更新</p>
                  <p>{formatDateTime(selectedGirl.updatedAt)}</p>
                </div>
              </div>

              {/* 備考（全文表示） */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">備考</p>
                <div className="bg-muted/50 rounded-md p-4 min-h-[150px] max-h-[300px] overflow-y-auto">
                  {selectedGirl.note ? (
                    <p className="text-sm whitespace-pre-wrap">{selectedGirl.note}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">備考はありません</p>
                  )}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  閉じる
                </Button>
                <Button onClick={handleEditFromDetail}>
                  <Pencil className="h-4 w-4 mr-2" />
                  編集する
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
