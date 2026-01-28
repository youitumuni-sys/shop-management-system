"use client";

import { useState } from "react";
import { useProjects, Project, ProjectConfig } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Check, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  const {
    projects,
    activeProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    switchActiveProject,
  } = useProjects();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sparkScheduleShop: "",
    cityHeavenShopDir: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // フォームをリセット
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sparkScheduleShop: "",
      cityHeavenShopDir: "",
    });
  };

  // 新規追加ダイアログを開く
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // 編集ダイアログを開く
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      sparkScheduleShop: project.config.sparkScheduleShop,
      cityHeavenShopDir: project.config.cityHeavenShopDir,
    });
    setIsEditDialogOpen(true);
  };

  // 削除ダイアログを開く
  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  // プロジェクト追加
  const handleAdd = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    const config: ProjectConfig = {
      sparkScheduleShop: formData.sparkScheduleShop,
      cityHeavenShopDir: formData.cityHeavenShopDir,
    };

    await createProject({
      name: formData.name,
      description: formData.description,
      config,
    });

    setIsSaving(false);
    setIsAddDialogOpen(false);
    resetForm();
  };

  // プロジェクト更新
  const handleUpdate = async () => {
    if (!selectedProject || !formData.name.trim()) return;

    setIsSaving(true);
    const config: ProjectConfig = {
      sparkScheduleShop: formData.sparkScheduleShop,
      cityHeavenShopDir: formData.cityHeavenShopDir,
    };

    await updateProject({
      id: selectedProject.id,
      name: formData.name,
      description: formData.description,
      config,
    });

    setIsSaving(false);
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    resetForm();
  };

  // プロジェクト削除
  const handleDelete = async () => {
    if (!selectedProject) return;

    setIsSaving(true);
    await deleteProject(selectedProject.id);

    setIsSaving(false);
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  // アクティブプロジェクト切り替え
  const handleSwitch = async (projectId: string) => {
    await switchActiveProject(projectId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">プロジェクト管理</h1>
          <p className="text-muted-foreground">
            管理する店舗・プロジェクトを追加・編集できます
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          新規追加
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 現在のアクティブプロジェクト */}
      {activeProject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              現在のプロジェクト
            </CardTitle>
            <CardDescription>
              現在選択されているプロジェクトの情報です
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{activeProject.name}</p>
              <p className="text-sm text-muted-foreground">
                {activeProject.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sparkスケジュール店舗:</span>
                  <p className="font-medium">{activeProject.config.sparkScheduleShop || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">シティヘブンディレクトリ:</span>
                  <p className="font-medium">{activeProject.config.cityHeavenShopDir || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* プロジェクト一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>プロジェクト一覧</CardTitle>
          <CardDescription>
            登録されているすべてのプロジェクト
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              プロジェクトがありません。新規追加ボタンから追加してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>プロジェクト名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>Spark店舗</TableHead>
                  <TableHead>CHディレクトリ</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {project.description || "-"}
                    </TableCell>
                    <TableCell>{project.config.sparkScheduleShop || "-"}</TableCell>
                    <TableCell>{project.config.cityHeavenShopDir || "-"}</TableCell>
                    <TableCell>
                      {project.id === activeProject?.id ? (
                        <Badge className="bg-green-500">アクティブ</Badge>
                      ) : (
                        <Badge variant="outline">非アクティブ</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {project.id !== activeProject?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitch(project.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(project)}
                          disabled={projects.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 新規追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新規プロジェクト追加</DialogTitle>
            <DialogDescription>
              新しいプロジェクト（店舗）を追加します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">プロジェクト名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例: ぷるるん小町梅田"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="例: 梅田店の管理"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sparkScheduleShop">Sparkスケジュール店舗名</Label>
              <Input
                id="sparkScheduleShop"
                value={formData.sparkScheduleShop}
                onChange={(e) =>
                  setFormData({ ...formData, sparkScheduleShop: e.target.value })
                }
                placeholder="例: ぷるるん小町梅田"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cityHeavenShopDir">シティヘブンディレクトリ</Label>
              <Input
                id="cityHeavenShopDir"
                value={formData.cityHeavenShopDir}
                onChange={(e) =>
                  setFormData({ ...formData, cityHeavenShopDir: e.target.value })
                }
                placeholder="例: k_pururun-komachi_umeda"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.name.trim() || isSaving}
            >
              {isSaving ? "追加中..." : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>プロジェクト編集</DialogTitle>
            <DialogDescription>
              プロジェクトの情報を編集します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">プロジェクト名 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">説明</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sparkScheduleShop">Sparkスケジュール店舗名</Label>
              <Input
                id="edit-sparkScheduleShop"
                value={formData.sparkScheduleShop}
                onChange={(e) =>
                  setFormData({ ...formData, sparkScheduleShop: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cityHeavenShopDir">シティヘブンディレクトリ</Label>
              <Input
                id="edit-cityHeavenShopDir"
                value={formData.cityHeavenShopDir}
                onChange={(e) =>
                  setFormData({ ...formData, cityHeavenShopDir: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name.trim() || isSaving}
            >
              {isSaving ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>プロジェクト削除</DialogTitle>
            <DialogDescription>
              「{selectedProject?.name}」を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
