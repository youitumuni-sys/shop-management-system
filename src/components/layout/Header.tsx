"use client";

import { Menu, LogOut, User, FolderOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useProjects } from "@/hooks/useProjects";

interface HeaderProps {
  onMenuClick: () => void;
  userName?: string;
  onLogout?: () => void;
}

export function Header({ onMenuClick, userName = "ゲスト", onLogout }: HeaderProps) {
  const { projects, activeProject, switchActiveProject } = useProjects();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleProjectSwitch = async (projectId: string) => {
    await switchActiveProject(projectId);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-slate-800 dark:border-slate-700 px-4 lg:px-6">
      {/* モバイル: ハンバーガーメニュー */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">メニューを開く</span>
      </Button>

      {/* PC: スペーサー */}
      <div className="hidden lg:block" />

      {/* プロジェクト切り替え */}
      <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 max-w-xs">
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{activeProject?.name || "プロジェクト未選択"}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>プロジェクト切り替え</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects.length === 0 ? (
              <DropdownMenuItem disabled>
                プロジェクトがありません
              </DropdownMenuItem>
            ) : (
              projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleProjectSwitch(project.id)}
                  className={project.id === activeProject?.id ? "bg-accent" : ""}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {project.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        {/* テーマ切替 */}
        <ThemeToggle />

        {/* ユーザーメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>アカウント</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
