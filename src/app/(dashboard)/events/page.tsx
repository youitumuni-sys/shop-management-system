"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EventList,
  EventFormModal,
  EventDetailModal,
} from "@/components/features/events";
import { useEvents } from "@/hooks/useEvents";
import { ShopEvent } from "@/lib/mock-data/events";

export default function EventsPage() {
  const {
    toggleCheckItem,
    getEventsByStatus,
    stats,
    getEventStats,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  } = useEvents();

  const [activeTab, setActiveTab] = useState("ongoing");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ShopEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ShopEvent | null>(null);

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (event: ShopEvent) => {
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  const handleViewDetail = (event: ShopEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleSave = (
    eventData: Omit<ShopEvent, "id"> & { id?: string }
  ) => {
    if (eventData.id) {
      const { id, ...data } = eventData;
      updateEvent(id, data as Omit<ShopEvent, "id">);
    } else {
      addEvent(eventData as Omit<ShopEvent, "id">);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            イベントチェック
          </h1>
          <p className="text-muted-foreground">
            イベントの準備状況を管理します
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          新規イベント追加
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">開催中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoingCount}件</div>
            <p className="text-xs text-muted-foreground">
              チェック進捗: {stats.ongoingChecksCompleted}/
              {stats.ongoingChecksTotal} ({stats.ongoingPercentage}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">予定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingCount}件</div>
            <p className="text-xs text-muted-foreground">準備が必要です</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">終了</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCount}件</div>
            <p className="text-xs text-muted-foreground">完了済み</p>
          </CardContent>
        </Card>
      </div>

      {/* タブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ongoing" className="flex items-center gap-2">
            開催中
            <Badge variant="secondary">{stats.ongoingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            予定
            <Badge variant="secondary">{stats.upcomingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            終了
            <Badge variant="secondary">{stats.completedCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-4">
          <EventList
            events={getEventsByStatus("ongoing")}
            onToggleCheck={toggleCheckItem}
            getEventStats={getEventStats}
            onEdit={handleEdit}
            onViewDetail={handleViewDetail}
            onDelete={deleteEvent}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <EventList
            events={getEventsByStatus("upcoming")}
            onToggleCheck={toggleCheckItem}
            getEventStats={getEventStats}
            onEdit={handleEdit}
            onViewDetail={handleViewDetail}
            onDelete={deleteEvent}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <EventList
            events={getEventsByStatus("completed")}
            onToggleCheck={toggleCheckItem}
            getEventStats={getEventStats}
            onEdit={handleEdit}
            onViewDetail={handleViewDetail}
            onDelete={deleteEvent}
          />
        </TabsContent>
      </Tabs>

      {/* 追加・編集モーダル */}
      <EventFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        event={editingEvent}
        onSave={handleSave}
      />

      {/* 詳細表示モーダル */}
      <EventDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        event={selectedEvent}
        onToggleCheck={toggleCheckItem}
        getEventStats={getEventStats}
        getEventById={getEventById}
      />
    </div>
  );
}
