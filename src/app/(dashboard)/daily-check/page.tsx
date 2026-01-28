"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Plus } from "lucide-react";
import { DailyCheckList } from "@/components/features/daily-check";
import { useDailyCheck } from "@/hooks/useDailyCheck";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DailyCheckPage() {
  const {
    categories,
    toggleCheck,
    resetAll,
    stats,
    getCategoryStats,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    isDefaultItem,
    isDefaultCategory,
    isInitialized,
  } = useDailyCheck();

  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);

  // 初期化前はローディング表示
  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">日次チェック</h1>
            <p className="text-muted-foreground">
              毎日の業務チェックリストです
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">日次チェック</h1>
          <p className="text-muted-foreground">
            毎日の業務チェックリストです
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setQuickAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            タスク追加
          </Button>
          <Button variant="outline" onClick={resetAll}>
            <RotateCcw className="h-4 w-4 mr-2" />
            リセット
          </Button>
        </div>
      </div>

      <DailyCheckList
        categories={categories}
        onToggle={toggleCheck}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        isDefaultItem={isDefaultItem}
        isDefaultCategory={isDefaultCategory}
        stats={stats}
        getCategoryStats={getCategoryStats}
      />

      {/* クイックタスク追加ダイアログ */}
      <QuickAddItemDialog
        open={quickAddDialogOpen}
        onOpenChange={setQuickAddDialogOpen}
        categories={categories}
        onAdd={(categoryId, item) => {
          addItem(categoryId, item);
          setQuickAddDialogOpen(false);
        }}
      />
    </div>
  );
}

// クイックタスク追加ダイアログ（カテゴリ選択付き）
interface QuickAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string }>;
  onAdd: (categoryId: string, item: { title: string; description?: string; howTo?: string }) => void;
}

function QuickAddItemDialog({
  open,
  onOpenChange,
  categories,
  onAdd,
}: QuickAddItemDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [howTo, setHowTo] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !categoryId) return;
    onAdd(categoryId, {
      title: title.trim(),
      description: description.trim() || undefined,
      howTo: howTo.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setHowTo("");
    setCategoryId("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setTitle("");
      setDescription("");
      setHowTo("");
      setCategoryId("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスクを追加</DialogTitle>
          <DialogDescription>
            新しいチェック項目を追加します。カテゴリを選択してください。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-category">カテゴリ *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="quick-category">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-title">タイトル *</Label>
            <Input
              id="quick-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトル"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-description">説明</Label>
            <Input
              id="quick-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="タスクの説明（任意）"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-howTo">やり方</Label>
            <Input
              id="quick-howTo"
              value={howTo}
              onChange={(e) => setHowTo(e.target.value)}
              placeholder="タスクのやり方（任意）"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !categoryId}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
