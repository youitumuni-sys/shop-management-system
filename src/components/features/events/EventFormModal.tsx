"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShopEvent, EventCheckItem, EventStatus } from "@/lib/mock-data/events";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: ShopEvent | null;
  onSave: (event: Omit<ShopEvent, "id"> & { id?: string }) => void;
}

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  checkItems: { id: string; title: string; checked: boolean; checkedAt?: string }[];
}

export function EventFormModal({
  open,
  onOpenChange,
  event,
  onSave,
}: EventFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    checkItems: [],
  });

  const [newCheckItem, setNewCheckItem] = useState("");

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description || "",
        startDate: event.startDate,
        endDate: event.endDate,
        checkItems: [...event.checkItems],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        checkItems: [],
      });
    }
    setNewCheckItem("");
  }, [event, open]);

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const newItem: EventCheckItem = {
      id: `new-${Date.now()}`,
      title: newCheckItem.trim(),
      checked: false,
    };
    setFormData((prev) => ({
      ...prev,
      checkItems: [...prev.checkItems, newItem],
    }));
    setNewCheckItem("");
  };

  const handleRemoveCheckItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      checkItems: prev.checkItems.filter((item) => item.id !== itemId),
    }));
  };

  const calculateStatus = (startDate: string, endDate: string): EventStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < today) return "completed";
    if (start > today) return "upcoming";
    return "ongoing";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) return;

    const status = calculateStatus(formData.startDate, formData.endDate);

    onSave({
      ...(event ? { id: event.id } : {}),
      name: formData.name,
      description: formData.description || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status,
      checkItems: formData.checkItems,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? "イベントを編集" : "新規イベント追加"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">イベント名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="イベント名を入力"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日 *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">終了日 *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明・内容</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="イベントの詳細説明"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>チェック項目</Label>
            <div className="flex gap-2">
              <Input
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                placeholder="チェック項目を追加"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCheckItem();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCheckItem}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.checkItems.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.checkItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <span className="text-sm">{item.title}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveCheckItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit">
              {event ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
