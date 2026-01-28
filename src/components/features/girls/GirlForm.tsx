"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Girl, GirlFormData, needsInterview } from "./types";
import { AlertTriangle } from "lucide-react";

interface GirlFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GirlFormData) => void;
  initialData?: Girl;
  mode: "create" | "edit";
}

export function GirlForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: GirlFormProps) {
  const [formData, setFormData] = useState<GirlFormData>({
    name: "",
    note: "",
    interviewed: false,
    lastInterviewDate: null,
  });

  // initialDataが変更されたときにフォームデータを更新
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        note: initialData.note,
        interviewed: initialData.interviewed,
        lastInterviewDate: initialData.lastInterviewDate,
      });
    } else {
      setFormData({
        name: "",
        note: "",
        interviewed: false,
        lastInterviewDate: null,
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  // 面談済みチェック時に日付を自動設定
  const handleInterviewedChange = (checked: boolean) => {
    if (checked && !formData.lastInterviewDate) {
      setFormData({
        ...formData,
        interviewed: true,
        lastInterviewDate: new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        ...formData,
        interviewed: checked,
      });
    }
  };

  // 更新日時のフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const showInterviewWarning = formData.interviewed && needsInterview(formData.lastInterviewDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新規登録" : "編集"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* 名前 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                名前 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="例: さよ"
                required
              />
            </div>

            {/* 面談ステータス */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">
                面談状況
              </label>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="interviewed"
                    checked={formData.interviewed}
                    onChange={(e) => handleInterviewedChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="interviewed" className="text-sm">
                    面談済み
                  </label>
                </div>

                {formData.interviewed && (
                  <div className="flex items-center gap-2">
                    <label htmlFor="lastInterviewDate" className="text-sm text-muted-foreground">
                      最終面談日:
                    </label>
                    <Input
                      type="date"
                      id="lastInterviewDate"
                      value={formData.lastInterviewDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastInterviewDate: e.target.value || null,
                        })
                      }
                      className="w-auto"
                    />
                  </div>
                )}

                {showInterviewWarning && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-amber-700 dark:text-amber-400">
                      最終面談から1ヶ月以上経過しています。面談が必要です。
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 備考 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="note" className="text-right text-sm font-medium pt-2">
                備考
              </label>
              <div className="col-span-3 space-y-2">
                <textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                  placeholder="話した内容や共有事項を記録してください&#10;&#10;例:&#10;・お客様からの評価が高い&#10;・シフト調整の相談あり"
                />
                <p className="text-xs text-muted-foreground">
                  話した内容、面談予定、共有事項などを自由に記録できます
                </p>
                {mode === "edit" && initialData && (
                  <p className="text-xs text-muted-foreground">
                    最終更新: {formatDate(initialData.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit">
              {mode === "create" ? "登録" : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
