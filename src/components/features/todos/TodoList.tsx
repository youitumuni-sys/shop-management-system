"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Calendar,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Todo, TodoFormData, TodoFrequency } from "./types";
import { TodoForm } from "./TodoForm";
import { useFrequencyTodos } from "./useFrequencyTodos";

export function TodoList() {
  const {
    dailyTodos,
    quarterlyTodos,
    isLoaded,
    isDailyCompleted,
    isQuarterlyCompleted,
    toggleDailyComplete,
    toggleQuarterlyComplete,
    addTodo,
    updateTodo,
    deleteTodo,
    dailyProgress,
    quarterlyProgress,
    pendingQuarterlyCount,
    isCurrentlyQuarterlyMonth,
    currentQuarterMonth,
  } = useFrequencyTodos();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<Todo | null>(null);
  const [activeTab, setActiveTab] = useState<TodoFrequency>("daily");

  const handleCreate = (data: TodoFormData) => {
    addTodo(data);
  };

  const handleUpdate = (data: TodoFormData) => {
    if (!editingTodo) return;
    updateTodo(editingTodo.id, data);
    setEditingTodo(undefined);
  };

  const handleDelete = (todo: Todo) => {
    deleteTodo(todo.id);
    setDeleteConfirm(null);
  };

  const openEditForm = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTodo(undefined);
  };

  const openCreateForm = () => {
    setEditingTodo(undefined);
    setIsFormOpen(true);
  };

  // ローディング中
  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            読み込み中...
          </div>
        </CardContent>
      </Card>
    );
  }

  // 四半期月の表示用フォーマット
  const formatQuarterMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return `${year}年${month}月`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>やることリスト</CardTitle>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </CardHeader>
      <CardContent>
        {/* 四半期リマインダー */}
        {isCurrentlyQuarterlyMonth && pendingQuarterlyCount > 0 && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">
                四半期確認月です
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {formatQuarterMonth(currentQuarterMonth)}
                は確認月です。{pendingQuarterlyCount}
                件の3ヶ月ごとにやることが未完了です。
              </p>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TodoFrequency)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              毎日やること
              <Badge variant="secondary" className="ml-1">
                {dailyTodos.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              3ヶ月ごとにやること
              <Badge variant="secondary" className="ml-1">
                {quarterlyTodos.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* 毎日やることタブ */}
          <TabsContent value="daily">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  今日の進捗
                </span>
                <span className="text-sm font-medium">{dailyProgress}%</span>
              </div>
              <Progress value={dailyProgress} className="h-2" />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">完了</TableHead>
                  <TableHead>タイトル</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyTodos.map((todo) => {
                  const isCompleted = isDailyCompleted(todo.id);
                  return (
                    <TableRow
                      key={todo.id}
                      className={isCompleted ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleDailyComplete(todo.id)}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isCompleted
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isCompleted && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell
                        className={
                          isCompleted ? "line-through" : "font-medium"
                        }
                      >
                        {todo.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {todo.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(todo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(todo)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {dailyTodos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                毎日やることがありません
              </div>
            )}
          </TabsContent>

          {/* 3ヶ月ごとにやることタブ */}
          <TabsContent value="quarterly">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {formatQuarterMonth(currentQuarterMonth)}の進捗
                </span>
                <span className="text-sm font-medium">
                  {quarterlyProgress}%
                </span>
              </div>
              <Progress value={quarterlyProgress} className="h-2" />
            </div>

            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                確認月: 3月、6月、9月、12月
              </p>
              {!isCurrentlyQuarterlyMonth && (
                <p className="text-sm text-muted-foreground mt-1">
                  次の確認月: {formatQuarterMonth(currentQuarterMonth)}
                </p>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">完了</TableHead>
                  <TableHead>タイトル</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead className="w-20">状態</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarterlyTodos.map((todo) => {
                  const isCompleted = isQuarterlyCompleted(todo.id);
                  return (
                    <TableRow
                      key={todo.id}
                      className={isCompleted ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleQuarterlyComplete(todo.id)}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isCompleted
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isCompleted && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell
                        className={
                          isCompleted ? "line-through" : "font-medium"
                        }
                      >
                        {todo.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {todo.description}
                      </TableCell>
                      <TableCell>
                        {isCompleted ? (
                          <Badge className="bg-green-500 hover:bg-green-500">
                            完了
                          </Badge>
                        ) : isCurrentlyQuarterlyMonth ? (
                          <Badge className="bg-orange-500 hover:bg-orange-500">
                            要確認
                          </Badge>
                        ) : (
                          <Badge variant="secondary">待機中</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(todo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(todo)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {quarterlyTodos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                3ヶ月ごとにやることがありません
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <TodoForm
        open={isFormOpen}
        onClose={closeForm}
        onSubmit={editingTodo ? handleUpdate : handleCreate}
        initialData={editingTodo}
        defaultFrequency={activeTab}
      />

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除の確認</DialogTitle>
            <DialogDescription>
              「{deleteConfirm?.title}」を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
