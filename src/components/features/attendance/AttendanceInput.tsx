"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AttendanceRecord, AttendanceStatus, AttendanceStatusType } from "./types";

interface AttendanceInputProps {
  records: AttendanceRecord[];
  onStatusChange: (girlId: string, status: AttendanceStatusType) => void;
  onTimeChange: (girlId: string, field: "startTime" | "endTime", value: string) => void;
  date: string;
}

const statusButtons: { status: AttendanceStatusType; label: string; color: string }[] = [
  {
    status: AttendanceStatus.PRESENT,
    label: "○",
    color: "bg-green-500 hover:bg-green-600 text-white",
  },
  {
    status: AttendanceStatus.ABSENT,
    label: "×",
    color: "bg-red-500 hover:bg-red-600 text-white",
  },
  {
    status: AttendanceStatus.UNCERTAIN,
    label: "△",
    color: "bg-amber-500 hover:bg-amber-600 text-white",
  },
];

export function AttendanceInput({
  records,
  onStatusChange,
  onTimeChange,
  date,
}: AttendanceInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>出勤入力</span>
          <span className="text-base font-normal text-muted-foreground">
            {date}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.girlId}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              {/* 名前 */}
              <div className="w-32 font-medium">{record.girlName}</div>

              {/* ステータスボタン */}
              <div className="flex gap-2">
                {statusButtons.map(({ status, label, color }) => (
                  <Button
                    key={status}
                    size="lg"
                    className={cn(
                      "h-12 w-12 text-xl font-bold transition-all",
                      record.status === status
                        ? color
                        : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                    )}
                    onClick={() => onStatusChange(record.girlId, status)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* 時間入力（出勤の場合のみ表示） */}
              {record.status === AttendanceStatus.PRESENT && (
                <div className="flex items-center gap-2 ml-4">
                  <Input
                    type="time"
                    value={record.startTime || ""}
                    onChange={(e) =>
                      onTimeChange(record.girlId, "startTime", e.target.value)
                    }
                    className="w-28"
                  />
                  <span className="text-muted-foreground">〜</span>
                  <Input
                    type="time"
                    value={record.endTime || ""}
                    onChange={(e) =>
                      onTimeChange(record.girlId, "endTime", e.target.value)
                    }
                    className="w-28"
                  />
                </div>
              )}

              {/* 現在のステータス表示 */}
              <div className="ml-auto">
                <StatusBadge status={record.status} />
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              採用済みの女の子がいません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: AttendanceStatusType }) {
  const getStatusStyle = () => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "bg-green-100 text-green-800";
      case AttendanceStatus.ABSENT:
        return "bg-red-100 text-red-800";
      case AttendanceStatus.UNCERTAIN:
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "出勤";
      case AttendanceStatus.ABSENT:
        return "欠勤";
      case AttendanceStatus.UNCERTAIN:
        return "未定";
      default:
        return "未入力";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        getStatusStyle()
      )}
    >
      {status !== AttendanceStatus.NONE && (
        <span className="mr-1 text-lg">{status}</span>
      )}
      {getStatusText()}
    </span>
  );
}
