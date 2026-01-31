"use client";

import { useState, useEffect, useCallback } from "react";
import { Megaphone, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "dashboard-notice";

interface NoticeData {
  content: string;
  updatedAt: string;
}

export function NoticeBoard() {
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // LocalStorageから読み込み
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotice(JSON.parse(stored));
      }
    } catch (error) {
      console.error("連絡事項の読み込みに失敗:", error);
    }
    setIsInitialized(true);
  }, []);

  // 保存
  const saveNotice = useCallback(() => {
    const newNotice: NoticeData = {
      content: editContent.trim(),
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotice));
      setNotice(newNotice);
      setIsEditing(false);
    } catch (error) {
      console.error("連絡事項の保存に失敗:", error);
    }
  }, [editContent]);

  // 編集開始
  const startEditing = () => {
    setEditContent(notice?.content || "");
    setIsEditing(true);
  };

  // 編集キャンセル
  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent("");
  };

  // 更新日時のフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  if (!isInitialized) return null;

  return (
    <Card className="border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg font-semibold text-amber-800 dark:text-amber-400">
            連絡事項
          </CardTitle>
          {notice?.updatedAt && !isEditing && (
            <span className="text-xs text-muted-foreground">
              （更新: {formatDate(notice.updatedAt)}）
            </span>
          )}
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={startEditing}
            className="gap-1 border-amber-300 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
          >
            <Edit2 className="h-4 w-4" />
            編集
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cancelEditing}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={saveNotice}
              className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Save className="h-4 w-4" />
              保存
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="連絡事項を入力してください..."
            className="min-h-[100px] bg-white dark:bg-gray-900"
            autoFocus
          />
        ) : notice?.content ? (
          <div className="whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-200">
            {notice.content}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            連絡事項はありません。「編集」ボタンから追加できます。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
