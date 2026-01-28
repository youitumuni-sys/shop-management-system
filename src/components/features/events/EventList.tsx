"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ShopEvent, EventStatus } from "@/lib/mock-data/events";

interface EventListProps {
  events: ShopEvent[];
  onToggleCheck: (eventId: string, itemId: string) => void;
  getEventStats: (eventId: string) => {
    total: number;
    completed: number;
    percentage: number;
  };
  onEdit?: (event: ShopEvent) => void;
  onViewDetail?: (event: ShopEvent) => void;
  onDelete?: (eventId: string) => void;
}

const statusConfig: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  ongoing: { label: "開催中", variant: "default" },
  upcoming: { label: "予定", variant: "secondary" },
  completed: { label: "終了", variant: "outline" },
};

export function EventList({
  events,
  onToggleCheck,
  getEventStats,
  onEdit,
  onViewDetail,
  onDelete,
}: EventListProps) {
  const [expandedEvents, setExpandedEvents] = useState<string[]>(
    events.filter((e) => e.status === "ongoing").map((e) => e.id)
  );

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          該当するイベントはありません
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isExpanded = expandedEvents.includes(event.id);
        const stats = getEventStats(event.id);
        const config = statusConfig[event.status];

        return (
          <Card key={event.id}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpand(event.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {event.name}
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.startDate)} -{" "}
                        {formatDate(event.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-2">
                    {onViewDetail && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(event);
                        }}
                        title="詳細表示"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(event);
                        }}
                        title="編集"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("このイベントを削除しますか?")) {
                            onDelete(event.id);
                          }
                        }}
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {stats.completed}/{stats.total}
                  </span>
                  <Badge
                    variant={stats.percentage === 100 ? "default" : "outline"}
                    className={cn(
                      stats.percentage === 100 &&
                        "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {stats.percentage}%
                  </Badge>
                </div>
              </div>
              {event.status === "ongoing" && (
                <Progress value={stats.percentage} className="h-2 mt-2" />
              )}
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {event.description}
                  </p>
                )}
                <div className="space-y-2">
                  {event.checkItems.map((item) => (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCheck(event.id, item.id);
                        }}
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
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
