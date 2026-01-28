"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DailyCheckCategory, DailyCheckItem } from "@/lib/mock-data/daily-check";

interface DailyCheckListProps {
  categories: DailyCheckCategory[];
  onToggle: (itemId: string) => void;
  onAddItem: (categoryId: string, item: { title: string; description?: string; howTo?: string }) => void;
  onUpdateItem: (itemId: string, updates: { title?: string; description?: string; howTo?: string }) => void;
  onDeleteItem: (itemId: string) => boolean;
  onAddCategory: (name: string) => string;
  onUpdateCategory: (categoryId: string, name: string) => void;
  onDeleteCategory: (categoryId: string) => boolean;
  isDefaultItem: (itemId: string) => boolean;
  isDefaultCategory: (categoryId: string) => boolean;
  stats: {
    total: number;
    completed: number;
    percentage: number;
  };
  getCategoryStats: (categoryId: string) => {
    total: number;
    completed: number;
    percentage: number;
  };
}

export function DailyCheckList({
  categories,
  onToggle,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isDefaultItem,
  isDefaultCategory,
  stats,
  getCategoryStats,
}: DailyCheckListProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [addItemDialogOpen, setAddItemDialogOpen] = useState<string | null>(null);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState<DailyCheckItem | null>(null);
  const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState<DailyCheckItem | null>(null);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState<DailyCheckCategory | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState<DailyCheckCategory | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="space-y-6">
      {/* 全体進捗 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">本日の進捗</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddCategoryDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              カテゴリ追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={stats.percentage} className="flex-1" />
            <span className="text-sm font-medium min-w-[80px] text-right">
              {stats.completed} / {stats.total} 完了
            </span>
            <Badge
              variant={stats.percentage === 100 ? "default" : "secondary"}
              className={cn(
                stats.percentage === 100 && "bg-green-500 hover:bg-green-600"
              )}
            >
              {stats.percentage}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別チェックリスト */}
      <div className="space-y-4">
        {categories.map((category) => {
          const catStats = getCategoryStats(category.id);
          const isExpanded = expandedCategories.includes(category.id);
          const isDefault = isDefaultCategory(category.id);

          return (
            <Card key={category.id}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    {!isDefault && (
                      <Badge variant="outline" className="text-xs">
                        カスタム
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {catStats.completed}/{catStats.total}
                    </span>
                    <Badge
                      variant={
                        catStats.percentage === 100 ? "default" : "outline"
                      }
                      className={cn(
                        catStats.percentage === 100 &&
                          "bg-green-500 hover:bg-green-600"
                      )}
                    >
                      {catStats.percentage}%
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddItemDialogOpen(category.id);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          タスク追加
                        </DropdownMenuItem>
                        {!isDefault && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditCategoryDialogOpen(category);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              カテゴリ編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteCategoryDialogOpen(category);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              カテゴリ削除
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <CheckItem
                        key={item.id}
                        item={item}
                        onToggle={() => onToggle(item.id)}
                        isDefault={isDefaultItem(item.id)}
                        onEdit={() => setEditItemDialogOpen(item)}
                        onDelete={() => setDeleteItemDialogOpen(item)}
                      />
                    ))}
                    {category.items.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        タスクがありません
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* タスク追加ダイアログ */}
      <AddItemDialog
        open={addItemDialogOpen !== null}
        onOpenChange={(open) => !open && setAddItemDialogOpen(null)}
        onAdd={(item) => {
          if (addItemDialogOpen) {
            onAddItem(addItemDialogOpen, item);
            setAddItemDialogOpen(null);
          }
        }}
      />

      {/* タスク編集ダイアログ */}
      <EditItemDialog
        open={editItemDialogOpen !== null}
        item={editItemDialogOpen}
        onOpenChange={(open) => !open && setEditItemDialogOpen(null)}
        onSave={(updates) => {
          if (editItemDialogOpen) {
            onUpdateItem(editItemDialogOpen.id, updates);
            setEditItemDialogOpen(null);
          }
        }}
      />

      {/* タスク削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteItemDialogOpen !== null}
        title="タスクを削除"
        description={`「${deleteItemDialogOpen?.title}」を削除しますか？この操作は取り消せません。`}
        onOpenChange={(open) => !open && setDeleteItemDialogOpen(null)}
        onConfirm={() => {
          if (deleteItemDialogOpen) {
            onDeleteItem(deleteItemDialogOpen.id);
            setDeleteItemDialogOpen(null);
          }
        }}
      />

      {/* カテゴリ追加ダイアログ */}
      <AddCategoryDialog
        open={addCategoryDialogOpen}
        onOpenChange={setAddCategoryDialogOpen}
        onAdd={(name) => {
          onAddCategory(name);
          setAddCategoryDialogOpen(false);
        }}
      />

      {/* カテゴリ編集ダイアログ */}
      <EditCategoryDialog
        open={editCategoryDialogOpen !== null}
        category={editCategoryDialogOpen}
        onOpenChange={(open) => !open && setEditCategoryDialogOpen(null)}
        onSave={(name) => {
          if (editCategoryDialogOpen) {
            onUpdateCategory(editCategoryDialogOpen.id, name);
            setEditCategoryDialogOpen(null);
          }
        }}
      />

      {/* カテゴリ削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteCategoryDialogOpen !== null}
        title="カテゴリを削除"
        description={`「${deleteCategoryDialogOpen?.name}」カテゴリとその中のすべてのタスクを削除しますか？この操作は取り消せません。`}
        onOpenChange={(open) => !open && setDeleteCategoryDialogOpen(null)}
        onConfirm={() => {
          if (deleteCategoryDialogOpen) {
            onDeleteCategory(deleteCategoryDialogOpen.id);
            setDeleteCategoryDialogOpen(null);
          }
        }}
      />
    </div>
  );
}

interface CheckItemProps {
  item: DailyCheckItem;
  onToggle: () => void;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function CheckItem({ item, onToggle, isDefault, onEdit, onDelete }: CheckItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        item.checked
          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
          : "bg-background hover:bg-muted/50"
      )}
    >
      <Button
        variant={item.checked ? "default" : "outline"}
        size="icon"
        className={cn(
          "h-8 w-8 shrink-0",
          item.checked && "bg-green-500 hover:bg-green-600"
        )}
        onClick={onToggle}
      >
        {item.checked && <Check className="h-4 w-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium",
              item.checked && "line-through text-muted-foreground"
            )}
          >
            {item.title}
          </span>
          {item.isCustom && (
            <Badge variant="outline" className="text-xs">
              カスタム
            </Badge>
          )}
          {item.howTo && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{item.title} - やり方</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {item.howTo}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground truncate">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {item.checkedAt && (
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(item.checkedAt).toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        {!isDefault && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                編集
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// タスク追加ダイアログ
interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: { title: string; description?: string; howTo?: string }) => void;
}

function AddItemDialog({ open, onOpenChange, onAdd }: AddItemDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [howTo, setHowTo] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      howTo: howTo.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setHowTo("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスクを追加</DialogTitle>
          <DialogDescription>
            新しいチェック項目を追加します。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトル"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="タスクの説明（任意）"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="howTo">やり方</Label>
            <Input
              id="howTo"
              value={howTo}
              onChange={(e) => setHowTo(e.target.value)}
              placeholder="タスクのやり方（任意）"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// タスク編集ダイアログ
interface EditItemDialogProps {
  open: boolean;
  item: DailyCheckItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: { title?: string; description?: string; howTo?: string }) => void;
}

function EditItemDialog({ open, item, onOpenChange, onSave }: EditItemDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [howTo, setHowTo] = useState("");

  // アイテムが変わったらフォームをリセット
  useState(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setHowTo(item.howTo || "");
    }
  });

  // openが変わった時にも値を設定
  if (open && item && title === "" && item.title !== "") {
    setTitle(item.title);
    setDescription(item.description || "");
    setHowTo(item.howTo || "");
  }

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      howTo: howTo.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setHowTo("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setTitle("");
      setDescription("");
      setHowTo("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスクを編集</DialogTitle>
          <DialogDescription>
            タスクの内容を編集します。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">タイトル *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスクのタイトル"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">説明</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="タスクの説明（任意）"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-howTo">やり方</Label>
            <Input
              id="edit-howTo"
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
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 削除確認ダイアログ
interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function DeleteConfirmDialog({
  open,
  title,
  description,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// カテゴリ追加ダイアログ
interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string) => void;
}

function AddCategoryDialog({ open, onOpenChange, onAdd }: AddCategoryDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カテゴリを追加</DialogTitle>
          <DialogDescription>
            新しいカテゴリを作成します。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">カテゴリ名 *</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="カテゴリ名"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// カテゴリ編集ダイアログ
interface EditCategoryDialogProps {
  open: boolean;
  category: DailyCheckCategory | null;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

function EditCategoryDialog({
  open,
  category,
  onOpenChange,
  onSave,
}: EditCategoryDialogProps) {
  const [name, setName] = useState("");

  // カテゴリが変わったらフォームをリセット
  if (open && category && name === "" && category.name !== "") {
    setName(category.name);
  }

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setName("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カテゴリを編集</DialogTitle>
          <DialogDescription>
            カテゴリ名を編集します。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category-name">カテゴリ名 *</Label>
            <Input
              id="edit-category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="カテゴリ名"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
