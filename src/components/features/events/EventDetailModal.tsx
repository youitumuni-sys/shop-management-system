"use client";

import { Check, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ShopEvent, EventStatus } from "@/lib/mock-data/events";

interface EventDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ShopEvent | null;
  onToggleCheck: (eventId: string, itemId: string) => void;
  getEventStats: (eventId: string) => {
    total: number;
    completed: number;
    percentage: number;
  };
  getEventById?: (eventId: string) => ShopEvent | null;
}

const statusConfig: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  ongoing: { label: "開催中", variant: "default" },
  upcoming: { label: "予定", variant: "secondary" },
  completed: { label: "終了", variant: "outline" },
};

export function EventDetailModal({
  open,
  onOpenChange,
  event,
  onToggleCheck,
  getEventStats,
  getEventById,
}: EventDetailModalProps) {
  if (!event) return null;

  // 最新のイベント情報を取得（getEventByIdがあれば使用）
  const currentEvent = getEventById ? getEventById(event.id) || event : event;
  const stats = getEventStats(currentEvent.id);
  const config = statusConfig[currentEvent.status];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentEvent.name}
            <Badge variant={config.variant}>{config.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(currentEvent.startDate)} - {formatDate(currentEvent.endDate)}
            </span>
          </div>

          {currentEvent.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{currentEvent.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">チェック進捗</span>
              <span className="text-sm text-muted-foreground">
                {stats.completed}/{stats.total} ({stats.percentage}%)
              </span>
            </div>
            <Progress value={stats.percentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">チェック項目</span>
            {currentEvent.checkItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                チェック項目はありません
              </p>
            ) : (
              <div className="space-y-2">
                {currentEvent.checkItems.map((item) => (
                  <div
                    key={item.id}
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
                      onClick={() => onToggleCheck(currentEvent.id, item.id)}
                    >
                      {item.checked && <Check className="h-4 w-4" />}
                    </Button>
                    <span
                      className={cn(
                        "flex-1",
                        item.checked && "line-through text-muted-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                    {item.checkedAt && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.checkedAt).toLocaleDateString("ja-JP")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
