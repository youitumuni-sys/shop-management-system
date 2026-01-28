"use client";

import { useState, useMemo } from "react";
import { Pencil, Check, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// 給料条件の型定義
export interface SalaryCondition {
  id: string;
  girlId: string;
  girlName: string;
  hourlyRate: number; // 時給
  guarantee: number; // 保証
  backRate: number; // バック率（%）
  transportation: number; // 交通費
  bonus: string; // ボーナス条件
  notes: string; // その他条件
}

// モックデータ
const mockSalaryConditions: SalaryCondition[] = [
  {
    id: "s1",
    girlId: "1",
    girlName: "さくら",
    hourlyRate: 3000,
    guarantee: 15000,
    backRate: 50,
    transportation: 1000,
    bonus: "指名3本以上で+5000円",
    notes: "土日出勤で時給+500円",
  },
  {
    id: "s2",
    girlId: "2",
    girlName: "ひまり",
    hourlyRate: 2500,
    guarantee: 12000,
    backRate: 45,
    transportation: 800,
    bonus: "週4以上で月末ボーナス",
    notes: "",
  },
  {
    id: "s3",
    girlId: "3",
    girlName: "ゆい",
    hourlyRate: 3500,
    guarantee: 18000,
    backRate: 55,
    transportation: 1500,
    bonus: "リピート率70%以上で+10000円",
    notes: "VIP対応可能",
  },
  {
    id: "s4",
    girlId: "4",
    girlName: "みお",
    hourlyRate: 2800,
    guarantee: 14000,
    backRate: 48,
    transportation: 1000,
    bonus: "",
    notes: "研修期間中（3ヶ月）",
  },
  {
    id: "s5",
    girlId: "5",
    girlName: "あかり",
    hourlyRate: 3200,
    guarantee: 16000,
    backRate: 52,
    transportation: 1200,
    bonus: "新規獲得で+2000円/件",
    notes: "経験10年以上のベテラン",
  },
];

type SortKey = "girlName" | "hourlyRate" | "guarantee" | "backRate";
type SortOrder = "asc" | "desc";

export function SalaryConditions() {
  const [conditions, setConditions] =
    useState<SalaryCondition[]>(mockSalaryConditions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<SalaryCondition>>({});
  const [sortKey, setSortKey] = useState<SortKey>("girlName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);

  // ソート処理
  const sortedConditions = useMemo(() => {
    return [...conditions].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [conditions, sortKey, sortOrder]);

  // 比較対象のデータ
  const compareData = useMemo(() => {
    return conditions.filter((c) => compareIds.includes(c.id));
  }, [conditions, compareIds]);

  // 平均値の計算
  const averages = useMemo(() => {
    if (conditions.length === 0) return { hourlyRate: 0, guarantee: 0, backRate: 0 };
    return {
      hourlyRate: Math.round(
        conditions.reduce((sum, c) => sum + c.hourlyRate, 0) / conditions.length
      ),
      guarantee: Math.round(
        conditions.reduce((sum, c) => sum + c.guarantee, 0) / conditions.length
      ),
      backRate: Math.round(
        conditions.reduce((sum, c) => sum + c.backRate, 0) / conditions.length
      ),
    };
  }, [conditions]);

  // ソート切り替え
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // 編集開始
  const startEdit = (condition: SalaryCondition) => {
    setEditingId(condition.id);
    setEditData({ ...condition });
  };

  // 編集保存
  const saveEdit = () => {
    if (!editingId) return;
    setConditions((prev) =>
      prev.map((c) => (c.id === editingId ? { ...c, ...editData } : c))
    );
    setEditingId(null);
    setEditData({});
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  // 比較対象の切り替え
  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 通貨フォーマット
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ja-JP").format(value);
  };

  // ソートアイコン
  const SortIcon = ({ column }: { column: SortKey }) => (
    <ArrowUpDown
      className={cn(
        "ml-1 h-4 w-4 inline",
        sortKey === column && "text-primary"
      )}
    />
  );

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均時給
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(averages.hourlyRate)}円
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均保証
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(averages.guarantee)}円
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均バック率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averages.backRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* 比較ボタン */}
      {compareIds.length >= 2 && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCompareDialogOpen(true)}>
            選択中の{compareIds.length}名を比較
          </Button>
        </div>
      )}

      {/* 条件一覧テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>給料条件一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">比較</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("girlName")}
                  >
                    名前
                    <SortIcon column="girlName" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort("hourlyRate")}
                  >
                    時給
                    <SortIcon column="hourlyRate" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort("guarantee")}
                  >
                    保証
                    <SortIcon column="guarantee" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort("backRate")}
                  >
                    バック率
                    <SortIcon column="backRate" />
                  </TableHead>
                  <TableHead className="text-right">交通費</TableHead>
                  <TableHead>ボーナス条件</TableHead>
                  <TableHead>その他</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedConditions.map((condition) => (
                  <TableRow
                    key={condition.id}
                    className={cn(
                      compareIds.includes(condition.id) && "bg-blue-50"
                    )}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={compareIds.includes(condition.id)}
                        onChange={() => toggleCompare(condition.id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {condition.girlName}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === condition.id ? (
                        <Input
                          type="number"
                          value={editData.hourlyRate || 0}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              hourlyRate: parseInt(e.target.value),
                            })
                          }
                          className="w-24 text-right"
                        />
                      ) : (
                        `${formatCurrency(condition.hourlyRate)}円`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === condition.id ? (
                        <Input
                          type="number"
                          value={editData.guarantee || 0}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              guarantee: parseInt(e.target.value),
                            })
                          }
                          className="w-24 text-right"
                        />
                      ) : (
                        `${formatCurrency(condition.guarantee)}円`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === condition.id ? (
                        <Input
                          type="number"
                          value={editData.backRate || 0}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              backRate: parseInt(e.target.value),
                            })
                          }
                          className="w-20 text-right"
                        />
                      ) : (
                        `${condition.backRate}%`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === condition.id ? (
                        <Input
                          type="number"
                          value={editData.transportation || 0}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              transportation: parseInt(e.target.value),
                            })
                          }
                          className="w-24 text-right"
                        />
                      ) : (
                        `${formatCurrency(condition.transportation)}円`
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      {editingId === condition.id ? (
                        <Input
                          value={editData.bonus || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, bonus: e.target.value })
                          }
                          className="w-full"
                        />
                      ) : condition.bonus ? (
                        <Badge variant="outline">{condition.bonus}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {editingId === condition.id ? (
                        <Input
                          value={editData.notes || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, notes: e.target.value })
                          }
                          className="w-full"
                        />
                      ) : (
                        condition.notes || (
                          <span className="text-muted-foreground">-</span>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === condition.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={saveEdit}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(condition)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 比較ダイアログ */}
      <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>給料条件比較</DialogTitle>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>項目</TableHead>
                  {compareData.map((c) => (
                    <TableHead key={c.id} className="text-center">
                      {c.girlName}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">時給</TableCell>
                  {compareData.map((c) => {
                    const isMax =
                      c.hourlyRate ===
                      Math.max(...compareData.map((x) => x.hourlyRate));
                    return (
                      <TableCell
                        key={c.id}
                        className={cn("text-center", isMax && "text-green-600 font-bold")}
                      >
                        {formatCurrency(c.hourlyRate)}円
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">保証</TableCell>
                  {compareData.map((c) => {
                    const isMax =
                      c.guarantee ===
                      Math.max(...compareData.map((x) => x.guarantee));
                    return (
                      <TableCell
                        key={c.id}
                        className={cn("text-center", isMax && "text-green-600 font-bold")}
                      >
                        {formatCurrency(c.guarantee)}円
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">バック率</TableCell>
                  {compareData.map((c) => {
                    const isMax =
                      c.backRate ===
                      Math.max(...compareData.map((x) => x.backRate));
                    return (
                      <TableCell
                        key={c.id}
                        className={cn("text-center", isMax && "text-green-600 font-bold")}
                      >
                        {c.backRate}%
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">交通費</TableCell>
                  {compareData.map((c) => {
                    const isMax =
                      c.transportation ===
                      Math.max(...compareData.map((x) => x.transportation));
                    return (
                      <TableCell
                        key={c.id}
                        className={cn("text-center", isMax && "text-green-600 font-bold")}
                      >
                        {formatCurrency(c.transportation)}円
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ボーナス条件</TableCell>
                  {compareData.map((c) => (
                    <TableCell key={c.id} className="text-center text-sm">
                      {c.bonus || "-"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">その他</TableCell>
                  {compareData.map((c) => (
                    <TableCell key={c.id} className="text-center text-sm">
                      {c.notes || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCompareIds([]);
                setIsCompareDialogOpen(false);
              }}
            >
              比較をクリア
            </Button>
            <Button onClick={() => setIsCompareDialogOpen(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
