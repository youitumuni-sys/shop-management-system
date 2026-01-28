"use client";

import { useState, useEffect, useCallback } from "react";

// 型定義
export interface ProjectConfig {
  sparkScheduleShop: string;
  cityHeavenShopDir: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  config: ProjectConfig;
}

export interface ProjectsData {
  projects: Project[];
  activeProjectId: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  config?: ProjectConfig;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  config?: ProjectConfig;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // プロジェクト一覧取得
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/projects");
      const result = await response.json();

      if (result.success) {
        setProjects(result.data.projects);
        setActiveProjectId(result.data.activeProjectId);
      } else {
        setError(result.message || "プロジェクト取得に失敗しました");
      }
    } catch (err) {
      setError("プロジェクト取得に失敗しました");
      console.error("プロジェクト取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初期ロード
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // アクティブプロジェクト取得
  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // プロジェクト作成
  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<Project | null> => {
      try {
        setError(null);

        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const result = await response.json();

        if (result.success) {
          await fetchProjects(); // データ再取得
          return result.data;
        } else {
          setError(result.message || "プロジェクト追加に失敗しました");
          return null;
        }
      } catch (err) {
        setError("プロジェクト追加に失敗しました");
        console.error("プロジェクト追加エラー:", err);
        return null;
      }
    },
    [fetchProjects]
  );

  // プロジェクト更新
  const updateProject = useCallback(
    async (input: UpdateProjectInput): Promise<Project | null> => {
      try {
        setError(null);

        const response = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const result = await response.json();

        if (result.success) {
          await fetchProjects(); // データ再取得
          return result.data;
        } else {
          setError(result.message || "プロジェクト更新に失敗しました");
          return null;
        }
      } catch (err) {
        setError("プロジェクト更新に失敗しました");
        console.error("プロジェクト更新エラー:", err);
        return null;
      }
    },
    [fetchProjects]
  );

  // プロジェクト削除
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);

        const response = await fetch(`/api/projects?id=${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          await fetchProjects(); // データ再取得
          return true;
        } else {
          setError(result.message || "プロジェクト削除に失敗しました");
          return false;
        }
      } catch (err) {
        setError("プロジェクト削除に失敗しました");
        console.error("プロジェクト削除エラー:", err);
        return false;
      }
    },
    [fetchProjects]
  );

  // アクティブプロジェクト切り替え
  const switchActiveProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);

        const response = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, setActive: true }),
        });

        const result = await response.json();

        if (result.success) {
          setActiveProjectId(id);
          return true;
        } else {
          setError(result.message || "プロジェクト切り替えに失敗しました");
          return false;
        }
      } catch (err) {
        setError("プロジェクト切り替えに失敗しました");
        console.error("プロジェクト切り替えエラー:", err);
        return false;
      }
    },
    []
  );

  // IDでプロジェクト取得
  const getProjectById = useCallback(
    (id: string): Project | undefined => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  return {
    // データ
    projects,
    activeProject,
    activeProjectId,
    loading,
    error,

    // 操作
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    switchActiveProject,
    getProjectById,
  };
}
