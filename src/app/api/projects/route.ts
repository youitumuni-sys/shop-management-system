import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// プロジェクト設定の型定義
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

// データファイルパス
const DATA_FILE = path.join(process.cwd(), "data", "projects.json");

// データを読み込む
function loadProjects(): ProjectsData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("プロジェクトデータ読み込みエラー:", error);
  }
  // デフォルトデータ
  return {
    projects: [],
    activeProjectId: "",
  };
}

// データを保存する
function saveProjects(data: ProjectsData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("プロジェクトデータ保存エラー:", error);
    throw error;
  }
}

// ID生成
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// GET: プロジェクト一覧取得
export async function GET() {
  const data = loadProjects();
  return NextResponse.json({
    success: true,
    data,
  });
}

// POST: 新規プロジェクト追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, config } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "プロジェクト名は必須です" },
        { status: 400 }
      );
    }

    const data = loadProjects();

    const newProject: Project = {
      id: generateId(),
      name,
      description: description || "",
      config: config || {
        sparkScheduleShop: "",
        cityHeavenShopDir: "",
      },
    };

    data.projects.push(newProject);

    // アクティブプロジェクトが未設定の場合、新規追加したプロジェクトをアクティブに
    if (!data.activeProjectId) {
      data.activeProjectId = newProject.id;
    }

    saveProjects(data);

    return NextResponse.json({
      success: true,
      data: newProject,
      message: "プロジェクトを追加しました",
    });
  } catch (error) {
    console.error("プロジェクト追加エラー:", error);
    return NextResponse.json(
      { success: false, message: "プロジェクト追加に失敗しました" },
      { status: 500 }
    );
  }
}

// PUT: プロジェクト更新 または アクティブプロジェクト切り替え
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, config, setActive } = body;

    const data = loadProjects();

    // アクティブプロジェクト切り替えの場合
    if (setActive && id) {
      const project = data.projects.find((p) => p.id === id);
      if (!project) {
        return NextResponse.json(
          { success: false, message: "プロジェクトが見つかりません" },
          { status: 404 }
        );
      }
      data.activeProjectId = id;
      saveProjects(data);
      return NextResponse.json({
        success: true,
        data: project,
        message: "アクティブプロジェクトを切り替えました",
      });
    }

    // プロジェクト更新の場合
    if (!id) {
      return NextResponse.json(
        { success: false, message: "プロジェクトIDは必須です" },
        { status: 400 }
      );
    }

    const projectIndex = data.projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return NextResponse.json(
        { success: false, message: "プロジェクトが見つかりません" },
        { status: 404 }
      );
    }

    const existingProject = data.projects[projectIndex];
    const updatedProject: Project = {
      ...existingProject,
      name: name ?? existingProject.name,
      description: description ?? existingProject.description,
      config: config ?? existingProject.config,
    };

    data.projects[projectIndex] = updatedProject;
    saveProjects(data);

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: "プロジェクトを更新しました",
    });
  } catch (error) {
    console.error("プロジェクト更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "プロジェクト更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: プロジェクト削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "プロジェクトIDは必須です" },
        { status: 400 }
      );
    }

    const data = loadProjects();
    const projectIndex = data.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        { success: false, message: "プロジェクトが見つかりません" },
        { status: 404 }
      );
    }

    data.projects.splice(projectIndex, 1);

    // 削除したプロジェクトがアクティブだった場合、別のプロジェクトをアクティブに
    if (data.activeProjectId === id) {
      data.activeProjectId = data.projects.length > 0 ? data.projects[0].id : "";
    }

    saveProjects(data);

    return NextResponse.json({
      success: true,
      message: "プロジェクトを削除しました",
    });
  } catch (error) {
    console.error("プロジェクト削除エラー:", error);
    return NextResponse.json(
      { success: false, message: "プロジェクト削除に失敗しました" },
      { status: 500 }
    );
  }
}
