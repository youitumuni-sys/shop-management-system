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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Todo, TodoFormData, TodoFrequency } from "./types";

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TodoFormData) => void;
  initialData?: Todo;
  defaultFrequency?: TodoFrequency;
}

export function TodoForm({
  open,
  onClose,
  onSubmit,
  initialData,
  defaultFrequency = "daily",
}: TodoFormProps) {
  const [formData, setFormData] = useState<TodoFormData>({
    title: "",
    description: "",
    frequency: defaultFrequency,
    completed: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        frequency: initialData.frequency,
        completed: initialData.completed,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        frequency: defaultFrequency,
        completed: false,
      });
    }
  }, [initialData, open, defaultFrequency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "タスクを編集" : "新規タスク"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              タイトル
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              説明
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="frequency" className="text-sm font-medium">
              頻度
            </label>
            <Select
              value={formData.frequency}
              onValueChange={(value: TodoFrequency) =>
                setFormData({ ...formData, frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="頻度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">毎日やること</SelectItem>
                <SelectItem value="quarterly">3ヶ月ごとにやること</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">{initialData ? "更新" : "作成"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
