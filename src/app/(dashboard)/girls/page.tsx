"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  GirlForm,
  GirlTable,
  Girl,
  GirlFormData,
  GirlTag,
} from "@/components/features/girls";

export default function GirlsPage() {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGirl, setEditingGirl] = useState<Girl | undefined>(undefined);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hideDummy, setHideDummy] = useState(true); // ダミーを非表示にするフィルター

  // データを取得
  const fetchGirls = useCallback(async () => {
    try {
      const res = await fetch("/api/girls");
      const data = await res.json();
      if (data.success) {
        setGirls(data.data);
      }
    } catch (error) {
      console.error("データ取得エラー:", error);
      setMessage({ type: "error", text: "データの取得に失敗しました" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGirls();
  }, [fetchGirls]);

  // メッセージを一定時間後にクリア
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCreate = () => {
    setEditingGirl(undefined);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (girl: Girl) => {
    setEditingGirl(girl);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除してよろしいですか？")) return;

    try {
      const res = await fetch(`/api/girls?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setGirls(girls.filter((g) => g.id !== id));
        setMessage({ type: "success", text: "削除しました" });
      } else {
        setMessage({ type: "error", text: data.message || "削除に失敗しました" });
      }
    } catch (error) {
      console.error("削除エラー:", error);
      setMessage({ type: "error", text: "削除に失敗しました" });
    }
  };

  const handleSubmit = async (data: GirlFormData) => {
    try {
      if (formMode === "create") {
        const res = await fetch("/api/girls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          setGirls([...girls, result.data]);
          setMessage({ type: "success", text: "登録しました" });
        } else {
          setMessage({ type: "error", text: result.message || "登録に失敗しました" });
        }
      } else if (editingGirl) {
        const res = await fetch("/api/girls", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingGirl.id, ...data }),
        });
        const result = await res.json();
        if (result.success) {
          setGirls(girls.map((g) => (g.id === editingGirl.id ? result.data : g)));
          setMessage({ type: "success", text: "更新しました" });
        } else {
          setMessage({ type: "error", text: result.message || "更新に失敗しました" });
        }
      }
    } catch (error) {
      console.error("保存エラー:", error);
      setMessage({ type: "error", text: "保存に失敗しました" });
    }
  };

  // 出勤データから取り込み
  const handleImport = async () => {
    setIsImporting(true);
    setMessage(null);

    try {
      // まず保存済みの出勤データを取得
      const scrapeRes = await fetch("/api/scrape");
      const scrapeData = await scrapeRes.json();

      if (!scrapeData.success || !scrapeData.data) {
        setMessage({ type: "error", text: "出勤データがありません。先にスクレイピングを実行してください。" });
        return;
      }

      const { attendance, scrapedAt } = scrapeData.data;

      if (!attendance || attendance.length === 0) {
        setMessage({ type: "error", text: "出勤データが空です" });
        return;
      }

      // 女の子マスタにインポート
      const importRes = await fetch("/api/girls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          attendanceData: attendance,
          scrapedAt,
        }),
      });

      const importResult = await importRes.json();

      if (importResult.success) {
        setGirls(importResult.data);
        setMessage({
          type: "success",
          text: `取り込み完了: ${importResult.addedCount}名追加、${importResult.updatedCount}名更新`,
        });
      } else {
        setMessage({ type: "error", text: importResult.message || "取り込みに失敗しました" });
      }
    } catch (error) {
      console.error("取り込みエラー:", error);
      setMessage({ type: "error", text: "取り込みに失敗しました" });
    } finally {
      setIsImporting(false);
    }
  };

  // フィルタリングされた女の子リスト
  const filteredGirls = hideDummy
    ? girls.filter((g) => g.tag !== GirlTag.DUMMY)
    : girls;

  // 統計情報（ダミーを除いた数値）
  const nonDummyGirls = girls.filter((g) => g.tag !== GirlTag.DUMMY);
  const stats = {
    total: nonDummyGirls.length,
    regular: girls.filter((g) => g.tag === GirlTag.REGULAR).length,
    rare: girls.filter((g) => g.tag === GirlTag.RARE).length,
    retired: girls.filter((g) => g.tag === GirlTag.RETIRED).length,
    dummy: girls.filter((g) => g.tag === GirlTag.DUMMY).length,
    needsInterview: nonDummyGirls.filter((g) => {
      if (!g.interviewed) return true;
      if (!g.lastInterviewDate) return true;
      const lastDate = new Date(g.lastInterviewDate);
      const oneMonthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      return lastDate < oneMonthAgo;
    }).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">女の子マスタ</h1>
          <p className="text-muted-foreground">
            在籍キャストの情報管理・面談管理を行います
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport} disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            出勤データから取り込み
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </div>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">合計</p>
          <p className="text-2xl font-bold">{stats.total}名</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">レギュラー</p>
          <p className="text-2xl font-bold text-green-600">{stats.regular}名</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">レア</p>
          <p className="text-2xl font-bold text-amber-600">{stats.rare}名</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">退店</p>
          <p className="text-2xl font-bold text-gray-500">{stats.retired}名</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">ダミー</p>
          <p className="text-2xl font-bold text-slate-400">{stats.dummy}名</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">要面談</p>
          <p className="text-2xl font-bold text-red-600">{stats.needsInterview}名</p>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hideDummy"
          checked={hideDummy}
          onCheckedChange={(checked) => setHideDummy(checked === true)}
        />
        <Label htmlFor="hideDummy" className="text-sm text-muted-foreground cursor-pointer">
          ダミーキャストを非表示
        </Label>
      </div>

      <GirlTable girls={filteredGirls} onEdit={handleEdit} onDelete={handleDelete} />

      <GirlForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingGirl}
        mode={formMode}
      />
    </div>
  );
}
